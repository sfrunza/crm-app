class Api::V1::RequestsController < ApplicationController
  include Pundit::Authorization
  before_action :set_request,
                only: %i[show update pair clone delete_image images attach_signature customer_requests calculate calculate_routes]

  def index
    case Current.user.role
    when "admin", "manager"
      render_admin_index
    when "customer"
      render_customer_index
    when "foreman"
      render_foreman_index
    when "driver", "helper"
      render_mover_index
    else
      render json: { error: "Unauthorized" }, status: :forbidden
    end
  end

  def show
    authorize @request
    @request.log_viewed
    render json: @request, serializer: RequestSerializer, include: [
      "customer",
      "foreman",
      "delivery_foreman",
      "service",
      "packing_type",
      "movers",
      "trucks",
      "request_rooms",
      "request_rooms.request_items"
    ], status: :ok
  rescue Pundit::NotAuthorizedError
    render_not_found
  end

  def create
    @request = Request.new(request_params.except(:id))
    authorize @request

    result = RequestSaveService.call(@request, action: :create)

    if result[:success]
      render json: @request, status: :created
    else
      render json: result[:errors], status: :unprocessable_entity
    end
  end

  def pair
    authorize @request
    paired_request = Request.find(params[:paired_request_id])

    if @request.pair_with(paired_request)
      render json: { success: true }, status: :ok
    else
      render json: @request.errors, status: :unprocessable_entity
    end
  end

  def unpair
    Request.transaction do
      request1 = Request.find(params[:request_id])
      request2 = Request.find(params[:paired_request_id])

      authorize request1

      request1.update!(paired_request_id: nil, is_moving_from_storage: false)
      request2.update!(paired_request_id: nil, is_moving_from_storage: false)
    end

    render json: { success: true }, status: :ok
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def clone
    authorize @request
    cloned = @request.dup
    cloned.moving_date = nil
    cloned.status = "pending"
    cloned.save!

    # clone associations as needed
    @request.extra_services.each do |extra|
      cloned.extra_services << extra.dup
    end

    render json: cloned, status: :created
  end

  def update
    authorize @request
    @request.assign_attributes(request_params.except(:move_size))

    result = RequestSaveService.call(@request, action: :update)

    if result[:success]
      render json: @request, status: :ok
    else
      render json: @request.errors, status: :unprocessable_entity
    end
  end

  # GET /api/v1/requests/:id/customer_requests
  def customer_requests
    authorize @request

    initial_requests = @request.customer.requests_as_customer.where.not(id: @request.id)
    pagy, paginated_requests = pagy(initial_requests.order(id: :desc), limit: 10)

    rendered_requests =
      ActiveModelSerializers::SerializableResource.new(
        paginated_requests,
        each_serializer: RequestTableSerializer
      )
    render json: {
      requests: rendered_requests,
      pagination: {
        total_pages: pagy.pages,
        current_page: pagy.page,
        total_count: pagy.count
      }
    }, status: :ok
  end

  def destroy
    @request = Request.find(params[:id])
    authorize @request
    @request.destroy
    head :no_content
  end

  def booking_stats
    authorize Request

    current_month = Date.today.all_month
    last_month    = Date.today.prev_month.all_month

    render json: {
      booked_this_month: Request.where(booked_at: current_month, status: :confirmed).count,
      booked_last_month: Request.where(booked_at: last_month, status: :confirmed).count
    }, status: :ok
  end

  def status_counts
    authorize Request

    pending_statuses = %w[pending pending_info pending_date hold]
    total_requests_count = Request.group(:status).count
    all_count = total_requests_count.values.sum

    # Aggregate all pending-like statuses under "pending"
    total_requests_count["pending"] = total_requests_count
      .slice(*pending_statuses)
      .values
      .sum

    # Remove individual counts of pending_info, pending_date, and hold
    pending_statuses[1..].each { |status| total_requests_count.delete(status) }

    # Add total count
    total_requests_count["all"] = all_count

    render json: total_requests_count, status: :ok
  end

  # POST /api/v1/requests/:id/images
  def images
    authorize @request
    if params[:images]
      params[:images].each { |image| @request.images.attach(image) }
    end

    if @request.save
      RequestLoggingService.call(@request, :update, @request.changes)
      RequestBroadcastService.call(@request, :update)
      render json: @request, status: :ok
    else
      render json: @request.errors.full_messages, status: :unprocessable_entity
    end
  end

  def delete_image
    authorize @request
    image = @request.images.find(params[:image_id])

    if image.purge
      RequestLoggingService.call(@request, :update, @request.changes)
      RequestBroadcastService.call(@request, :update)
      render json: @request, status: :ok
    else
      render json: { error: "Failed to delete image" }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/requests/:id/attach_signature
  def attach_signature
    authorize @request

    data_url = params[:signature]
    return render json: { error: "Invalid signature data" }, status: :unprocessable_entity unless data_url&.start_with?("data:image/")

    match = data_url.match(/\Adata:image\/(\w+);base64,(.+)\z/)
    return render json: { error: "Invalid signature format" }, status: :unprocessable_entity unless match

    allowed_types = %w[png jpeg jpg]
    return render json: { error: "Unsupported format" }, status: :unprocessable_entity unless allowed_types.include?(match[1])

    decoded = Base64.strict_decode64(match[2])
    io = StringIO.new(decoded)

    Request.transaction do
      @request.customer_signature.purge if @request.customer_signature.attached?

      @request.customer_signature.attach(
        io: io,
        filename: "signature.png",
        content_type: "image/#{match[1]}"
      )

      @request.update!(signed_at: Time.current)
    end

    render json: { signed_at: @request.signed_at }, status: :ok
  end

  # POST /api/v1/requests/:id/calculate
  # Params:
  #   - save: boolean (default: true) - whether to persist changes
  #   - preview params (move_size_id, moving_date, crew_size, etc.) - applied before calculation
  def calculate
    authorize @request

    payload = calculation_payload
    should_save = payload[:save] != false && payload[:save] != "false"

    # Apply any preview params before calculating
    calculate_params.each do |key, value|
      @request.public_send("#{key}=", value) if @request.respond_to?("#{key}=")
    end

    result = RequestCalculator.call(@request, save: should_save)

    if result[:success]
      render json: should_save ? @request.reload : @request, status: :ok
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/requests/:id/calculate_routes
  # Params:
  #   - save: boolean (default: true) - whether to persist changes
  #   - origin, destination, stops - address params to apply before calculation
  def calculate_routes
    authorize @request

    payload = calculation_payload
    should_save = payload[:save] != false && payload[:save] != "false"

    # Apply address params before calculating routes
    route_params.each do |key, value|
      @request.public_send("#{key}=", value) if @request.respond_to?("#{key}=")
    end

    result = RouteCalculator.call(@request, save: should_save)

    if result[:success]
      render json: should_save ? @request.reload : @request, status: :ok
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end

  private

  def filter_requests(requests, status_filter, date_filter)
    today = Date.today
    beginning_of_month = today.beginning_of_month
    end_of_month = today.end_of_month

    case status_filter
    when "all"
      # no status filter
    when "pending"
      pending_statuses = %w[pending pending_info pending_date hold]
      requests = requests.where(status: pending_statuses)
    else
      requests = requests.where(status: status_filter)
    end

    if status_filter == "confirmed"
      case date_filter
      when "booked_this_month"
        requests = requests.where(booked_at: beginning_of_month..end_of_month)
      when "upcoming_this_month"
        requests = requests.where(moving_date: beginning_of_month..end_of_month)
      when "upcoming_all"
        requests = requests.where("moving_date >= ?", today)
      end
    end

    requests
  end


  def render_admin_index
    status_filter = params[:status_filter]
    date_filter = params[:date_filter]
    sort_by = params[:sort_by] || "id"
    sort_order = %w[asc desc].include?(params[:sort_order]&.downcase) ? params[:sort_order] : "desc"

    initial_requests = Request.includes(:service, :move_size, :customer)
    requests = filter_requests(initial_requests, status_filter, date_filter)

    pagy, paginated_requests = pagy(requests.order(sort_by => sort_order), limit: 20)
    render_admin_requests(paginated_requests, pagy)
  end

  def render_customer_index
    filter = params[:filter] || "current"
    per_page = (params[:per_page].presence || Pagy::DEFAULT[:limit]).to_i
    per_page = Pagy::DEFAULT[:limit] if per_page < 1
    per_page = 20 if per_page > 20

    initial_requests = Current.user.requests_as_customer.order(id: :desc)
    initial_requests =
      case filter
      when "current"
        initial_requests.where("moving_date >= ?", Date.today)
      when "past"
        initial_requests.where("moving_date < ?", Date.today)
      else
        initial_requests
      end

    pagy, paginated_requests = pagy(initial_requests.order(id: :desc), limit: per_page)

    rendered_requests =
      ActiveModelSerializers::SerializableResource.new(
        paginated_requests,
        each_serializer: RequestTableSerializer
      )
    render json: {
      requests: rendered_requests,
      pagination: {
        total_pages: pagy.pages,
        current_page: pagy.page,
        total_count: pagy.count
      }
    }, status: :ok
  end

  def render_foreman_index
    @requests =
      policy_scope(Request).where(
        foreman_id: Current.user.id,
        status: :confirmed
      ).order(id: :desc)
    render_foreman_requests(@requests)
  end

  def render_mover_index
    @requests =
      policy_scope(Request)
        .where(status: :confirmed)
        .joins(:request_movers)
        .where(request_movers: { user_id: Current.user.id })
        .order(id: :desc)
    render_mover_requests(@requests)
  end

  def render_admin_requests(requests, pagy)
    rendered_requests =
      ActiveModelSerializers::SerializableResource.new(
        requests,
        each_serializer: RequestTableSerializer
      )

    render json: {
      requests: rendered_requests,
      pagination: {
        total_pages: pagy.pages,
        current_page: pagy.page,
        total_count: pagy.count
      }
    }, status: :ok
  end

  # TODO: Add foreman serializer
  def render_foreman_requests(requests)
    serialized_requests =
      ActiveModelSerializers::SerializableResource.new(
        requests,
        each_serializer: CustomerRequestSerializer
      )
    render json: { requests: serialized_requests }, status: :ok
  end

  # TODO: Add mover serializer
  def render_mover_requests(requests)
    serialized_requests =
      ActiveModelSerializers::SerializableResource.new(
        requests,
        each_serializer: CustomerRequestSerializer
      )
    render json: { requests: serialized_requests }, status: :ok
  end

  def set_request
    scope = Request

    # `show` renders `RequestSerializer`, which touches several associations (and ActionText + ActiveStorage).
    # Eager-load them here to avoid N+1 queries.
    if action_name == "show"
      scope =
        scope
          .includes(
            :customer,
            :foreman,
            :delivery_foreman,
            :service,
            :packing_type,
            :move_size,
            :paired_request,
            :movers,
            :trucks,
            :request_trucks,
            :request_movers,
            request_rooms: :request_items,
            images_attachments: :blob,
            customer_signature_attachment: :blob
          )
          .with_rich_text_sales_notes
          .with_rich_text_driver_notes
          .with_rich_text_customer_notes
          .with_rich_text_dispatch_notes
    end

    @request = scope.find_by(id: params[:id])

    # Return 404 if request is not found
    return if @request

    render json: { error: "Request not found" }, status: :not_found
  end

  def request_params
    params.require(:request).permit(
      # --- existing fields ---
      :customer_id,
      :service_id,
      :packing_type_id,
      :move_size_id,
      :foreman_id,
      :foreman_id_delivery,
      :customer,
      :payments,
      :paired_request_id,
      :paired_request,
      :moving_date,
      :start_time_window,
      :end_time_window,
      :start_time_window_delivery,
      :end_time_window_delivery,
      :start_time_window_schedule,
      :end_time_window_schedule,
      :delivery_date_window_start,
      :delivery_date_window_end,
      :schedule_date_window_start,
      :schedule_date_window_end,
      :signed_at,
      :booked_at,
      :is_same_day_delivery,
      :is_delivery_now,
      :is_calculator_enabled,
      :is_deposit_accepted,
      :is_moving_from_storage,
      :can_edit_request,
      :status,
      :rate,
      :travel_time,
      :deposit,
      :min_total_time,
      :extra_services_total,
      :packing_items_total,
      :crew_size,
      :crew_size_delivery,
      :sales_notes,
      :driver_notes,
      :customer_notes,
      :dispatch_notes,
      :move_size_snapshot,
      :total_items,
      :total_boxes,
      :total_volume,
      :total_weight,
      selected_suggested_room_ids: [],
      work_time: %i[min max],
      total_time: %i[min max],
      transportation: %i[min max],
      labor_price: %i[min max],
      grand_total: %i[min max],
      balance: %i[min max],
      fuel: %i[percent value total],
      discount: %i[percent value total],
      valuation: %i[total description name valuation_id],
      details: %i[
        delicate_items_question_answer
        bulky_items_question_answer
        disassemble_items_question_answer
        comments
        is_touched
      ],
      origin: permit_nested_location_params_with_location,
      destination: permit_nested_location_params_with_location,
      stops: [ permit_nested_location_params_with_location ],
      packing_items: %i[id name price quantity],
      extra_services: %i[id name price quantity],
      mover_ids: [],
      truck_ids: [],
      pickup_truck_ids: [],
      delivery_truck_ids: [],
      pickup_mover_ids: [],
      delivery_mover_ids: [],

      # --- NEW: request_rooms + nested request_items ---
      request_rooms: [
        :id,
        :room_id,
        :name,
        :is_custom,
        :position,
        request_items: [
          :id,
          :item_id,
          :name,
          :description,
          :volume,
          :weight,
          :is_box,
          :is_furniture,
          :is_special_handling,
          :is_custom,
          :quantity
        ]
      ]
    )
  end

  # def request_params
  #   params.require(:request).permit(
  #     :customer_id,
  #     :service_id,
  #     :packing_type_id,
  #     :foreman_id,
  #     :foreman_id_delivery,
  #     :payments,
  #     :customer,
  #     :moving_date,
  #     :delivery_date_window_start,
  #     :delivery_date_window_end,
  #     :schedule_date_window_start,
  #     :schedule_date_window_end,
  #     :is_same_day_delivery,
  #     :is_delivery_now,
  #     :is_calculator_enabled,
  #     :is_deposit_accepted,
  #     :status,
  #     :move_size_id,
  #     :start_time_window,
  #     :end_time_window,
  #     :start_time_window_delivery,
  #     :end_time_window_delivery,
  #     :start_time_window_schedule,
  #     :end_time_window_schedule,
  #     :crew_size,
  #     :crew_size_delivery,
  #     :rate,
  #     :sales_notes,
  #     :driver_notes,
  #     :customer_notes,
  #     :dispatch_notes,
  #     :deposit,
  #     :travel_time,
  #     :min_total_time,
  #     :can_edit_request,
  #     :paired_request_id,
  #     :paired_request,
  #     :is_moving_from_storage,
  #     :packing_items_total,
  #     :extra_services_total,
  #     work_time: %i[min max],
  #     total_time: %i[min max],
  #     transportation: %i[min max],
  #     fuel: %i[percent value total],
  #     discount: %i[percent value total],
  #     details: %i[
  #       delicate_items_question_answer
  #       bulky_items_question_answer
  #       disassemble_items_question_answer
  #       comments
  #       is_touched
  #     ],
  #     valuation: %i[total description name valuation_id],
  #     origin: permit_nested_location_params_with_location,
  #     destination: permit_nested_location_params_with_location,
  #     mover_ids: [],
  #     truck_ids: [],
  #     pickup_truck_ids: [],
  #     delivery_truck_ids: [],
  #     pickup_mover_ids: [],
  #     delivery_mover_ids: [],
  #     stops: [ permit_nested_location_params_with_location ],
  #     packing_items: %i[id name price quantity],
  #     extra_services: %i[id name price quantity],
  #   )
  # end


  def permit_nested_location_params
    %i[street city state zip apt floor_id type]
  end

  def permit_nested_location_params_with_location
    permit_nested_location_params + [ location: %i[lat lng] ]
  end

  def calculate_params
    calculation_payload.permit(
      :save,
      :move_size_id,
      :moving_date,
      :crew_size,
      :rate,
      :packing_type_id,
      :travel_time,
      :min_total_time,
      work_time: %i[min max],
      origin: permit_nested_location_params_with_location,
      destination: permit_nested_location_params_with_location
    ).to_h
  end

  def route_params
    calculation_payload.permit(
      :save,
      origin: permit_nested_location_params_with_location,
      destination: permit_nested_location_params_with_location,
      stops: [ permit_nested_location_params_with_location ]
    ).to_h
  end

  def calculation_payload
    nested = params[:request]
    return nested if nested.is_a?(ActionController::Parameters)

    params
  end
end

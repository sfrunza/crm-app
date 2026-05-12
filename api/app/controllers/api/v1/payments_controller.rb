class Api::V1::PaymentsController < ApplicationController
  # GET /api/v1/payments
  # Query: status, start_date, end_date (filter on created_at), page, per_page, sort_by, sort_order
  def index
    authorize Payment

    filtered = policy_scope(Payment)
    filtered = apply_filters(filtered)
    total_amount_cents = (filtered.sum(:amount) || 0).to_i

    payments = apply_sort(filtered)
    payments = payments.includes(:user)

    per_page = (params[:per_page].presence || Pagy::DEFAULT[:limit]).to_i
    per_page = Pagy::DEFAULT[:limit] if per_page < 1
    per_page = 100 if per_page > 100

    pagy_obj, paginated = pagy(payments, limit: per_page)

    render json: {
      payments: ActiveModelSerializers::SerializableResource.new(
        paginated,
        each_serializer: PaymentIndexSerializer
      ),
      pagination: {
        total_pages: pagy_obj.pages,
        current_page: pagy_obj.page,
        total_count: pagy_obj.count
      },
      total_amount: total_amount_cents.to_i
    }, status: :ok
  end

  # GET /api/v1/payments/status_counts
  def status_counts
    authorize Payment

    scope = apply_date_filters(policy_scope(Payment))
    raw_counts = scope.group(:status).count
    all_count = raw_counts.values.sum

    total_counts = Payment.statuses.keys.each_with_object({}) do |name, h|
      int_val = Payment.statuses[name]
      h[name] = raw_counts[name] ||
        raw_counts[name.to_s] ||
        raw_counts[int_val] ||
        raw_counts[int_val.to_s] ||
        0
    end
    total_counts["all"] = all_count

    render json: total_counts, status: :ok
  end

  private

  def apply_filters(scope)
    scope = apply_date_filters(scope)
    if params[:status].present?
      status = params[:status].to_s
      scope = scope.where(status: status) if Payment.statuses.key?(status)
    end
    scope
  end

  def apply_sort(scope)
    sort_by = params[:sort_by].to_s
    direction = params[:sort_order].to_s.downcase == "asc" ? :asc : :desc

    case sort_by
    when "id"
      scope.order(id: direction)
    when "amount"
      scope.order(amount: direction)
    when "status"
      scope.order(status: direction)
    when "payment_type"
      scope.order(payment_type: direction)
    when "request_id"
      scope.order(request_id: direction)
    when "date"
      scope.order(created_at: direction)
    when "username"
      scope.left_joins(:user).order(users: { first_name: direction, last_name: direction })
    else
      scope.order(created_at: :desc)
    end
  end

  def apply_date_filters(scope)
    if params[:start_date].present?
      start = parse_date_param(params[:start_date])
      scope = scope.where("payments.created_at >= ?", start.beginning_of_day) if start
    end

    if params[:end_date].present?
      finish = parse_date_param(params[:end_date])
      scope = scope.where("payments.created_at <= ?", finish.end_of_day) if finish
    end

    scope
  end

  def parse_date_param(value)
    Date.iso8601(value.to_s)
  rescue ArgumentError
    nil
  end
end

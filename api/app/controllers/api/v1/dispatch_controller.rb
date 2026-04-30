class Api::V1::DispatchController < ApplicationController
  def show
    date = Date.iso8601(params[:date])
    with_filters = params[:with_filters]

    slots =
      ParklotSlot
        .where(date: date)
        .includes(
          :truck,
          request: [
            :service, :move_size, :customer, :foreman,
            :delivery_foreman, :movers, :trucks, :request_trucks
          ]
        )
        .yield_self { |q| with_filters ? q.joins(:request).where(requests: { status: %w[completed confirmed] }) : q }

    # Pre-build the grouped hash with all active truck IDs
    truck_ids = Truck.where(active: true).pluck(:id)
    grouped = truck_ids.index_with { [] }

    # Group AR objects by truck_id FIRST (avoids serialization key-type issues),
    # then serialize each group.
    slots.each do |slot|
      grouped[slot.truck_id] << slot if grouped.key?(slot.truck_id)
    end

    result = grouped.transform_values do |truck_slots|
      ActiveModelSerializers::SerializableResource.new(
        truck_slots,
        each_serializer: ParklotSlotSerializer
      ).as_json
    end

    render json: result
  end

  def active_dates
    month = params[:month] # "2026-01"

    return render json: [] if month.blank?

    begin
      date = Date.strptime(month, "%Y-%m")
    rescue ArgumentError
      return render json: [], status: :bad_request
    end

    start_of_month = date.beginning_of_month
    end_of_month = date.end_of_month

    dates =
      ParklotSlot
        .joins(:request)
        .where(requests: { status: %w[completed confirmed] })
        .where(date: start_of_month..end_of_month)
        .distinct
        .pluck(:date)

    render json: dates
  end
end

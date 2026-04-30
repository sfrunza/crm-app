class RequestCalculator
  MINUTES_PER_CUBIC_FOOT_PER_MOVER = 1

  def self.call(request, save: true)
    new(request, save: save).call
  end

  def initialize(request, save: true)
    @request = request
    @save = save
  end

  def call
    return failure("Request not found") unless @request

    calculate_crew_size
    calculate_rate
    calculate_work_time
    calculate_pricing
    recalculate_routes_if_needed

    return success unless @save

    if @request.save
      success
    else
      failure(@request.errors.full_messages.join(", "))
    end
  end

  private

  def calculate_crew_size
    Rails.logger.info "[RequestCalculator] calculate_crew_size called for request #{@request.id}"

    unless @request.is_calculator_enabled
      Rails.logger.info "[RequestCalculator] Skipping crew_size - calculator disabled"
      return
    end

    unless @request.move_size.present?
      Rails.logger.info "[RequestCalculator] Skipping crew_size - no move_size"
      return
    end

    origin_floor = entrance_type_for(@request.origin)
    destination_floor = entrance_type_for(@request.destination)

    Rails.logger.info "[RequestCalculator] origin_floor: #{origin_floor&.id}, destination_floor: #{destination_floor&.id}"

    unless origin_floor && destination_floor
      Rails.logger.info "[RequestCalculator] Skipping crew_size - missing floor types"
      return
    end

    new_crew_size = @request.move_size.crew_size_for(origin_floor, destination_floor)
    Rails.logger.info "[RequestCalculator] Setting crew_size: #{new_crew_size}"
    @request.crew_size = new_crew_size
  end

  def calculate_rate
    Rails.logger.info "[RequestCalculator] calculate_rate called for request #{@request.id}"

    unless @request.is_calculator_enabled
      Rails.logger.info "[RequestCalculator] Skipping rate - calculator disabled"
      return
    end

    unless @request.moving_date.present?
      Rails.logger.info "[RequestCalculator] Skipping rate - no moving_date"
      return
    end

    crew_size = @request.crew_size.to_i
    if crew_size <= 0
      Rails.logger.info "[RequestCalculator] Skipping rate - crew_size is #{crew_size}"
      return
    end

    rate_record = find_rate_for_date(@request.moving_date)
    unless rate_record
      Rails.logger.info "[RequestCalculator] Skipping rate - no rate record found"
      return
    end

    hourly_rate = calculate_hourly_rate(rate_record, crew_size)
    hourly_rate += calculate_extra_truck_rate(rate_record)

    Rails.logger.info "[RequestCalculator] Setting rate: #{hourly_rate}"
    @request.rate = hourly_rate
  end

  MAX_BASE_CREW_SIZE = 4

  def calculate_hourly_rate(rate_record, crew_size)
    movers_rates = rate_record.movers_rates || {}

    Rails.logger.info "[RequestCalculator] crew_size: #{crew_size}, MAX_BASE_CREW_SIZE: #{MAX_BASE_CREW_SIZE}"

    # For crew sizes up to MAX_BASE_CREW_SIZE (4), use direct rate
    if crew_size <= MAX_BASE_CREW_SIZE
      rate = movers_rates.dig(crew_size.to_s, "hourly_rate").to_i
      Rails.logger.info "[RequestCalculator] Direct rate for #{crew_size} movers: #{rate}"
      return rate
    end

    # For crew sizes above MAX_BASE_CREW_SIZE, use the max base rate + extra mover fees
    base_rate = movers_rates.dig(MAX_BASE_CREW_SIZE.to_s, "hourly_rate").to_i
    extra_movers = crew_size - MAX_BASE_CREW_SIZE
    extra_mover_cost = extra_movers * rate_record.extra_mover_rate.to_i

    Rails.logger.info "[RequestCalculator] Base rate (#{MAX_BASE_CREW_SIZE} movers): #{base_rate}"
    Rails.logger.info "[RequestCalculator] Extra movers: #{extra_movers} x #{rate_record.extra_mover_rate} = #{extra_mover_cost}"

    base_rate + extra_mover_cost
  end

  def calculate_extra_truck_rate(rate_record)
    return 0 unless @request.move_size.present?

    truck_count = @request.move_size.truck_count.to_i
    return 0 if truck_count <= 1

    extra_trucks = truck_count - 1
    extra_truck_cost = extra_trucks * rate_record.extra_truck_rate.to_i

    Rails.logger.info "[RequestCalculator] Extra trucks: #{extra_trucks} x #{rate_record.extra_truck_rate} = #{extra_truck_cost}"
    extra_truck_cost
  end

  def calculate_work_time
    Rails.logger.info "[RequestCalculator] calculate_work_time called for request #{@request.id}"

    unless @request.is_calculator_enabled
      Rails.logger.info "[RequestCalculator] Skipping - calculator disabled"
      return
    end

    unless @request.move_size.present?
      Rails.logger.info "[RequestCalculator] Skipping - no move_size"
      return
    end

    crew = @request.crew_size.to_i
    if crew <= 0
      Rails.logger.info "[RequestCalculator] Skipping - crew_size is #{crew}"
      return
    end

    inventory_totals = RequestInventoryCalculator.new(@request).totals
    volume_range = inventory_totals[:volume_with_dispersion] || {}
    volume_min = volume_range[:min].to_f
    volume_max = volume_range[:max].to_f

    Rails.logger.info(
      "[RequestCalculator] Calculating from inventory volume: min=#{volume_min}, max=#{volume_max}, crew=#{crew}"
    )

    base_work_min = (volume_min * MINUTES_PER_CUBIC_FOOT_PER_MOVER / crew).ceil
    base_work_max = (volume_max * MINUTES_PER_CUBIC_FOOT_PER_MOVER / crew).ceil

    labor_increase = @request.packing_type&.labor_increase.to_i
    if labor_increase > 0
      multiplier = 1 + (labor_increase / 100.0)
      base_work_min = (base_work_min * multiplier).ceil
      base_work_max = (base_work_max * multiplier).ceil
    end

    base_work_min = round_to_nearest_15(base_work_min)
    base_work_max = round_to_nearest_15(base_work_max)

    Rails.logger.info "[RequestCalculator] Setting work_time: min=#{base_work_min}, max=#{base_work_max}"

    @request.work_time = { "min" => base_work_min, "max" => base_work_max }
  end

  def recalculate_routes_if_needed
    return unless should_recalculate_routes?

    RouteCalculator.call(@request)
  end

  def should_recalculate_routes?
    return false if @request.directions.present? && !locations_changed?

    has_origin = @request.origin.is_a?(Hash) &&
                 @request.origin.dig("location", "lat").to_f != 0
    has_destination = @request.destination.is_a?(Hash) &&
                      @request.destination.dig("location", "lat").to_f != 0

    has_origin || has_destination
  end

  def locations_changed?
    @request.origin_changed? || @request.destination_changed? || @request.stops_changed?
  end

  def entrance_type_for(address)
    return nil unless address.is_a?(Hash)

    floor_id = address["floor_id"] || address[:floor_id]
    return nil if floor_id.blank?

    EntranceType.find_by(id: floor_id)
  end

  def find_rate_for_date(date)
    calendar_rate = CalendarRate.find_by(date: date)

    if calendar_rate&.rate.present?
      calendar_rate.rate
    else
      Rate.find_by(is_default: true)
    end
  end

  def round_to_nearest_15(minutes)
    ((minutes / 15.0).ceil * 15).to_i
  end

  def calculate_pricing
    RequestPricingService.apply(@request)
  end

  def success
    { success: true, request: @request }
  end

  def failure(message)
    { success: false, error: message }
  end
end

class RequestSaveService
  def self.call(request, action: :update)
    new(request, action:).call
  end

  def initialize(request, action:)
    @request = request
    @action = action
    @tracked_changes = {}
    @routes_need_calculation = false
  end

  def call
    capture_changes_before_save
    mark_routes_for_calculation
    # apply_inventory_defaults
    apply_derived_fields
    apply_pricing
    validate_schedule

    return failure unless request.save

    trigger_side_effects
    success
  rescue ActiveRecord::RecordInvalid
    failure
  end

  private

  attr_reader :request, :action, :tracked_changes

  def capture_changes_before_save
    return if action == :create

    @tracked_changes = request.changes.except("updated_at", "created_at")
  end

  def mark_routes_for_calculation
    @routes_need_calculation = false

    if request.persisted?
      origin_loc_changed = location_changed?(:origin)
      destination_loc_changed = location_changed?(:destination)
      stops_loc_changed = stops_location_changed?
      service_changed = request.service_id_changed?

      @routes_need_calculation = origin_loc_changed || destination_loc_changed || stops_loc_changed || service_changed
    else
      @routes_need_calculation = has_any_coordinates?
    end
  end

  def apply_derived_fields
    RequestFieldsService.apply(request)
  end

  # def apply_inventory_defaults
  #   return unless action == :create
  #   return if request.inventory_rooms.present?

  #   request.inventory_rooms = RequestInventoryService.default_rooms_for_move_size(request.move_size)
  # end

  def apply_pricing
    RequestPricingService.apply(request)
  end

  def validate_schedule
    RequestScheduleValidator.call!(request)
  end

  def trigger_side_effects
    RequestBroadcastService.call(request, action)
    RequestLoggingService.call(request, action, tracked_changes)
    calculate_routes_if_needed
    regenerate_parklot_slots
    resolve_schedule_conflicts_if_needed
  end

  def calculate_routes_if_needed
    return unless @routes_need_calculation
    return unless has_any_coordinates?

    RouteCalculator.call(request)
  rescue => e
    Rails.logger.error "[RequestSaveService] Route calculation failed: #{e.message}"
  end

  def regenerate_parklot_slots
    ParklotSlotGenerator.call(request)
  rescue => e
    Rails.logger.error "[RequestSaveService] Parklot slot generation failed: #{e.message}"
  end

  def resolve_schedule_conflicts_if_needed
    return unless action == :update
    return unless tracked_changes.key?("status")
    return unless request.status == "confirmed"

    ResolveRequestConflicts.call!(request)
  end

  def location_changed?(field)
    return false unless request.send("#{field}_changed?")

    before = request.send("#{field}_was")
    after = request.send(field)

    extract_lat_lng(before) != extract_lat_lng(after)
  end

  def stops_location_changed?
    return false unless request.stops_changed?

    before = extract_stops_lat_lng(request.stops_was)
    after = extract_stops_lat_lng(request.stops)

    before != after
  end

  def has_any_coordinates?
    extract_lat_lng(request.origin).present? ||
      extract_lat_lng(request.destination).present? ||
      extract_stops_lat_lng(request.stops).any?
  end

  def extract_lat_lng(address)
    return nil unless address.is_a?(Hash)

    location = address["location"] || address[:location]
    return nil unless location.is_a?(Hash)

    lat = location["lat"] || location[:lat]
    lng = location["lng"] || location[:lng]

    return nil if lat.blank? || lng.blank?

    lat_f = lat.to_f
    lng_f = lng.to_f

    return nil if lat_f.zero? || lng_f.zero?

    [ lat_f, lng_f ]
  end

  def extract_stops_lat_lng(stops_val)
    return [] unless stops_val.is_a?(Array)

    stops_val.map { |s| extract_lat_lng(s) }.compact
  end

  def success
    { success: true, request: request }
  end

  def failure
    { success: false, errors: request.errors }
  end
end

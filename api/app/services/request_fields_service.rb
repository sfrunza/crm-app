class RequestFieldsService
  def self.apply(request)
    new(request).apply
  end

  def initialize(request)
    @request = request
  end

  def apply
    update_can_edit_request
    check_if_details_touched
    delivery_and_schedule_reset
  end

  private

  attr_reader :request

  def update_can_edit_request
    allowed_statuses = %w[pending pending_info pending_date hold not_confirmed]
    request.can_edit_request = allowed_statuses.include?(request.status)
  end

  def check_if_details_touched
    return unless request.details.is_a?(Hash)

    request.details["is_touched"] = request.details.values.any? do |value|
      value.is_a?(String) && !value.strip.empty?
    end
  end

  def delivery_and_schedule_reset
    return unless should_reset_delivery_fields?

    request.delivery_date_window_start = nil
    request.delivery_date_window_end = nil
    request.schedule_date_window_start = nil
    request.schedule_date_window_end = nil
    request.start_time_window_delivery = nil
    request.end_time_window_delivery = nil
    request.start_time_window_schedule = nil
    request.end_time_window_schedule = nil
    request.crew_size_delivery = nil
    request.is_delivery_now = nil
  end

  def should_reset_delivery_fields?
    return false unless request.persisted?

    is_flat_rate_with_delivery = request.service&.code == "flat_rate" && !request.is_same_day_delivery?
    has_paired_delivery = request.paired_request_id.present? && !request.is_moving_from_storage?
    return false if is_flat_rate_with_delivery || has_paired_delivery

    request.service_id_changed? || request.is_same_day_delivery_changed? ||
      request.paired_request_id_changed? || request.is_moving_from_storage_changed?
  end
end

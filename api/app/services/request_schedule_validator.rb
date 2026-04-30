class RequestScheduleValidator
  def self.call!(request)
    return unless request.status.in?(%w[confirmed not_confirmed])

    check_truck_required!(request)
    check_pickup_conflicts!(request)
    check_delivery_conflicts!(request)
  end

  # ====================================================================
  # A confirmed/not_confirmed request must have at least one pickup truck assigned.
  # ====================================================================

  def self.check_truck_required!(request)
    truck_ids = resolve_truck_ids(request, :pickup)
    return unless truck_ids.empty?

    request.errors.add(:base, "At least one truck must be selected on this status")
    raise ActiveRecord::RecordInvalid.new(request)
  end

  # ====================================================================
  # PICKUP: check the moving date against the pickup trucks.
  # ====================================================================

  def self.check_pickup_conflicts!(request)
    return if request.moving_date.blank?

    truck_ids = resolve_truck_ids(request, :pickup)
    return if truck_ids.empty?

    start_min = request.start_time_window || 0
    end_min   = start_min + job_duration(request)

    truck_ids.each do |truck_id|
      if slot_overlap?(request, truck_id, request.moving_date, start_min, end_min)
        raise_conflict!(request)
      end
    end
  end

  # ====================================================================
  # DELIVERY: check the schedule date window against the delivery trucks.
  # ====================================================================

  def self.check_delivery_conflicts!(request)
    return if request.schedule_date_window_start.blank? || request.schedule_date_window_end.blank?

    truck_ids = resolve_truck_ids(request, :delivery)
    return if truck_ids.empty?

    range_start = request.schedule_date_window_start
    range_end   = request.schedule_date_window_end

    (range_start..range_end).each do |date|
      is_first = date == range_start
      is_last  = date == range_end
      start_min, end_min = delivery_time_for_day(request, is_first, is_last)

      truck_ids.each do |truck_id|
        if slot_overlap?(request, truck_id, date, start_min, end_min)
          raise_conflict!(request)
        end
      end
    end
  end

  private

  # Use the pending (unsaved) truck IDs if the setter was called,
  # otherwise read the persisted IDs from the join table.
  # This prevents false positives when deselecting a truck.
  def self.resolve_truck_ids(request, purpose)
    ivar = :"@pending_#{purpose}_truck_ids"
    if request.instance_variable_defined?(ivar)
      request.instance_variable_get(ivar)
    else
      request.send(:"#{purpose}_truck_ids")
    end
  end

  # Check existing ParklotSlots for overlapping time on the same truck/date.
  # Only slots belonging to CONFIRMED requests count as conflicts, so multiple
  # not_confirmed requests can share the same spot. Excludes the current request's own slots.
  def self.slot_overlap?(request, truck_id, date, start_min, end_min)
    scope = ParklotSlot
      .joins(:request)
      .where(truck_id: truck_id, date: date, requests: { status: Request.statuses["confirmed"] })
      .where("parklot_slots.start_minutes < ? AND parklot_slots.end_minutes > ?", end_min, start_min)

    # For persisted records, exclude own slots
    scope = scope.where.not(parklot_slots: { request_id: request.id }) if request.persisted?

    scope.exists?
  end

  def self.job_duration(request)
    work_max  = request.work_time&.fetch("max", 0).to_i
    travel    = request.travel_time.to_i
    min_total = request.min_total_time.to_i
    [ work_max + travel, min_total ].max
  end

  def self.delivery_time_for_day(request, is_first, is_last)
    if is_first && is_last
      start_min = request.start_time_window_schedule || request.start_time_window_delivery || 0
      end_min   = request.end_time_window_schedule   || request.end_time_window_delivery   || 1440
      [ start_min, end_min ]
    elsif is_first
      start_min = request.start_time_window_schedule || request.start_time_window_delivery || 0
      [ start_min, 1440 ]
    elsif is_last
      end_min = request.end_time_window_schedule || request.end_time_window_delivery || 1440
      [ 0, end_min ]
    else
      [ 0, 1440 ]
    end
  end

  def self.raise_conflict!(request)
    request.errors.add(:base, "This spot already booked, please choose another truck or time slot")
    raise ActiveRecord::RecordInvalid.new(request)
  end
end

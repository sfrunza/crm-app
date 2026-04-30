class ParklotSlotGenerator
  GRID_START = 420   # 7:00 AM in minutes from midnight
  GRID_END   = 1320  # 10:00 PM in minutes from midnight

  def self.call(request)
    new(request).generate
  end

  def initialize(request)
    @request = request
  end

  def generate
    ParklotSlot.where(request_id: @request.id).delete_all

    slots = []
    slots.concat(build_pickup_slot)
    slots.concat(build_delivery_slots)

    ParklotSlot.insert_all(slots) if slots.any?
  end

  private

  # ====================================================================
  # PICKUP — a single slot on the moving date.
  # Uses pickup_truck_ids.
  # ====================================================================

  def build_pickup_slot
    return [] if @request.moving_date.blank?

    truck_ids = @request.pickup_truck_ids
    return [] if truck_ids.empty?

    start_min = @request.start_time_window || GRID_START
    end_min   = start_min + job_duration

    truck_ids.map do |truck_id|
      slot_attrs(truck_id, @request.moving_date, "pickup", true, start_min, end_min)
    end
  end

  # ====================================================================
  # DELIVERY — the entire schedule date window range.
  # Uses delivery_truck_ids.
  # ====================================================================

  def build_delivery_slots
    return [] if @request.schedule_date_window_start.blank? || @request.schedule_date_window_end.blank?

    truck_ids = @request.delivery_truck_ids
    return [] if truck_ids.empty?

    slots = []
    range_start = @request.schedule_date_window_start
    range_end   = @request.schedule_date_window_end

    (range_start..range_end).each do |date|
      is_first = date == range_start
      is_last  = date == range_end

      start_min, end_min = delivery_time_for_day(is_first, is_last)

      truck_ids.each do |truck_id|
        slots << slot_attrs(truck_id, date, "delivery", false, start_min, end_min)
      end
    end

    slots
  end

  # ====================================================================
  # Delivery time calculation (schedule window days)
  # ====================================================================

  def delivery_time_for_day(is_first, is_last)
    if is_first && is_last
      start_min = @request.start_time_window_schedule || @request.start_time_window_delivery || GRID_START
      end_min   = @request.end_time_window_schedule   || @request.end_time_window_delivery   || GRID_END
      [ start_min, end_min ]
    elsif is_first
      start_min = @request.start_time_window_schedule || @request.start_time_window_delivery || GRID_START
      [ start_min, GRID_END ]
    elsif is_last
      end_min = @request.end_time_window_schedule || @request.end_time_window_delivery || GRID_END
      [ GRID_START, end_min ]
    else
      [ GRID_START, GRID_END ]
    end
  end

  # ====================================================================
  # Helpers
  # ====================================================================

  def job_duration
    work_max  = @request.work_time&.fetch("max", 0).to_i
    travel    = @request.travel_time.to_i
    min_total = @request.min_total_time.to_i

    [ work_max + travel, min_total ].max
  end

  def slot_attrs(truck_id, date, slot_type, is_moving_day, start_minutes, end_minutes)
    now = Time.current
    {
      request_id: @request.id,
      truck_id: truck_id,
      date: date,
      slot_type: slot_type,
      is_moving_day: is_moving_day,
      start_minutes: start_minutes,
      end_minutes: end_minutes,
      created_at: now,
      updated_at: now
    }
  end
end

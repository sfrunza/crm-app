class ScheduleConflictFinder
  DAY_START_MINUTE = 0
  DAY_END_MINUTE = 24 * 60

  def initialize(request, truck_id, base_scope: Request.all)
    @request = request
    @truck_id = truck_id
    @base_scope = base_scope
  end

  def any_conflict?
    conflicts.any?
  end

  # Returns AR records of conflicting requests (excludes the given request)
  def conflicts
    dates.flat_map { |date| conflicts_on_date(date) }.uniq(&:id)
  end

  private

  attr_reader :request, :truck_id, :base_scope

  def dates
    (moving_dates + schedule_dates(request)).compact.uniq
  end

  def moving_dates
    request.moving_date.present? ? [ request.moving_date ] : []
  end

  def conflicts_on_date(date)
    candidate_scope(date).select do |other_request|
      overlap?(
        time_window_for_date(request, date),
        time_window_for_date(other_request, date)
      )
    end
  end

  def candidate_scope(date)
    base_scope
      .joins(:request_trucks)
      .where(request_trucks: { truck_id: truck_id })
      .where.not(id: request.id)
      .where(
        <<~SQL,
          moving_date = :date
          OR (:date BETWEEN schedule_date_window_start AND schedule_date_window_end)
          OR (schedule_date_window_start IS NOT NULL AND schedule_date_window_end IS NULL AND :date >= schedule_date_window_start)
          OR (schedule_date_window_end IS NOT NULL AND schedule_date_window_start IS NULL AND :date <= schedule_date_window_end)
        SQL
        date: date
      )
  end

  def schedule_dates(req)
    start_date = req.schedule_date_window_start
    end_date = req.schedule_date_window_end

    return [] if start_date.blank? && end_date.blank?
    return [ start_date ] if start_date.present? && end_date.blank?
    return [ end_date ] if end_date.present? && start_date.blank?

    range_start, range_end = [ start_date, end_date ].minmax
    (range_start..range_end).to_a
  end

  def schedule_day?(req, date)
    start_date = req.schedule_date_window_start
    end_date = req.schedule_date_window_end

    return false if start_date.blank? && end_date.blank?
    return date == start_date if end_date.blank?
    return date == end_date if start_date.blank?

    date >= start_date && date <= end_date
  end

  def time_window_for_date(req, date)
    if schedule_day?(req, date)
      schedule_time_window_for_date(req, date)
    else
      start_minute = req.start_time_window || DAY_START_MINUTE
      end_minute = request_end_minute(req) || DAY_END_MINUTE
      [ start_minute, end_minute ]
    end
  end

  def schedule_time_window_for_date(req, date)
    start_date = req.schedule_date_window_start
    end_date = req.schedule_date_window_end

    start_minute =
      if start_date && date == start_date
        req.start_time_window_schedule || req.start_time_window || DAY_START_MINUTE
      else
        DAY_START_MINUTE
      end

    end_minute =
      if end_date && date == end_date
        req.end_time_window_schedule || request_end_minute(req) || DAY_END_MINUTE
      else
        DAY_END_MINUTE
      end

    [ start_minute, end_minute ]
  end

  def request_end_minute(req)
    # return req.end_time_window if req.end_time_window.present?
    return unless req.start_time_window.present?

    req.end_minute
  end

  def overlap?(first_window, second_window)
    first_start, first_end = first_window
    second_start, second_end = second_window

    first_start < second_end && second_start < first_end
  end
end

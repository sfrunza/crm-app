class CalendarRatesSerializer
  # records is an array like:
  # [
  #   [id, date, rate_id, enable_automation, enable_auto_booking, is_blocked],
  #   ...
  # ]
  def initialize(records)
    @records = records
  end

  def as_json(*)
    @records.each_with_object({}) do |rate, hash|
      formatted_date = rate[1].strftime("%Y-%m-%d")

      hash[formatted_date] = {
        id: rate[0],
        formatted_date: formatted_date,
        rate_id: rate[2],
        enable_automation: rate[3],
        enable_auto_booking: rate[4],
        is_blocked: rate[5]
      }
    end
  end
end

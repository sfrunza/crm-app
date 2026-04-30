class RequestPricingService
  def self.apply(request)
    new(request).apply
  end

  def initialize(request)
    @request = request
  end

  def apply
    calculate_total_time
    calculate_pricing
  end

  private

  attr_reader :request

  def calculate_total_time
    min_total_time = request.min_total_time.to_i
    travel_time_minutes = request.travel_time.to_i
    work_time_min_minutes = hash_value(request.work_time, "min").to_i
    work_time_max_minutes = hash_value(request.work_time, "max").to_i

    total_minutes_min = [
      min_total_time,
      travel_time_minutes + work_time_min_minutes
    ].max
    total_minutes_max = [
      min_total_time,
      travel_time_minutes + work_time_max_minutes
    ].max

    request.total_time = { "min" => total_minutes_min, "max" => total_minutes_max }
  end

  def calculate_pricing
    request.labor_price    = compute_labor_price
    request.transportation = compute_transportation
    request.grand_total    = compute_grand_total
    request.balance        = compute_balance
  end

  def compute_labor_price
    if request.service.name == "Flat Rate"
      { "min" => request.rate || 0, "max" => request.rate || 0 }
    elsif request.work_time.present? && request.work_time.is_a?(Hash) && request.rate.present?
      work_hours_min = hash_value(request.work_time, "min").to_i / 60.0
      work_hours_max = hash_value(request.work_time, "max").to_i / 60.0
      { "min" => (work_hours_min * request.rate).round, "max" => (work_hours_max * request.rate).round }
    else
      { "min" => 0, "max" => 0 }
    end
  end

  def compute_transportation
    if request.service.name == "Flat Rate"
      { "min" => request.rate || 0, "max" => request.rate || 0 }
    elsif request.total_time.present? && request.total_time.is_a?(Hash) && request.rate.present?
      total_hours_min = hash_value(request.total_time, "min").to_i / 60.0
      total_hours_max = hash_value(request.total_time, "max").to_i / 60.0
      { "min" => (total_hours_min * request.rate).round, "max" => (total_hours_max * request.rate).round }
    else
      { "min" => 0, "max" => 0 }
    end
  end

  def compute_grand_total
    transport = request.transportation.is_a?(Hash) ? request.transportation : { "min" => 0, "max" => 0 }
    extras_total    = request.extra_services_total.to_i
    fuel_total      = request.fuel.is_a?(Hash) ? request.fuel["total"].to_i : 0
    packing_total   = request.packing_items_total.to_i
    valuation_total = request.valuation.is_a?(Hash) ? request.valuation["total"].to_i : 0
    discount_total  = request.discount.is_a?(Hash) ? request.discount["total"].to_i : 0

    addons = extras_total + fuel_total + packing_total + valuation_total - discount_total

    {
      min: transport["min"].to_i + addons,
      max: transport["max"].to_i + addons
    }
  end

  def compute_balance
    gt = request.grand_total.is_a?(Hash) ? request.grand_total : { "min" => 0, "max" => 0 }
    paid = payments_total

    if paid.zero? && request.is_deposit_accepted
      paid = request.deposit.to_i
    end

    {
      "min" => hash_value(gt, "min").to_i - paid,
      "max" => hash_value(gt, "max").to_i - paid
    }
  end

  def payments_total
    request.payments.successful.sum(:amount)
  end

  def hash_value(hash, key)
    return nil unless hash.is_a?(Hash)

    hash[key] || hash[key.to_sym]
  end
end

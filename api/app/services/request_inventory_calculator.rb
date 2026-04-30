class RequestInventoryCalculator
  def initialize(request)
    @request = request
  end

  def totals
    {
      items: total_items,
      boxes: total_boxes,
      volume: total_volume,
      weight: total_weight,
      volume_with_dispersion: volume_with_dispersion
    }
  end

  private

  def use_request_inventory?
    all_items.any?
  end

  def all_items
    @all_items ||= @request.request_rooms.includes(request_items: :item).flat_map(&:request_items)
  end

  def total_items
    return snapshot_total(:items).to_i unless use_request_inventory?
    all_items.sum(&:quantity)
  end

  def total_boxes
    return snapshot_total(:boxes).to_i unless use_request_inventory?
    all_items.sum { |item| box_item?(item) ? item.quantity : 0 }
  end

  def total_volume
    return snapshot_total(:volume).to_f unless use_request_inventory?
    all_items.sum { |i| (i.volume || 0) * i.quantity }
  end

  def total_weight
    return snapshot_total(:weight).to_f unless use_request_inventory?
    all_items.sum { |i| (i.weight || 0) * i.quantity }
  end

  def box_item?(request_item)
    return true if request_item.is_box
    request_item.item&.is_box || false
  end

  def volume_with_dispersion
    return snapshot_volume_with_dispersion unless use_request_inventory?

    dispersion = @request.move_size&.dispersion || 0
    base = total_volume
    {
      min: base - (base * dispersion / 100.0),
      max: base + (base * dispersion / 100.0)
    }
  end

  def snapshot
    @request.move_size_snapshot.is_a?(Hash) ? @request.move_size_snapshot : {}
  end

  def snapshot_totals
    value = snapshot[:totals] || snapshot["totals"]
    value.is_a?(Hash) ? value : {}
  end

  def snapshot_total(key)
    value = snapshot_totals[key] || snapshot_totals[key.to_s]
    value.to_f
  end

  def snapshot_volume_with_dispersion
    range = snapshot_totals[:volume_with_dispersion] || snapshot_totals["volume_with_dispersion"]
    return default_volume_with_dispersion if range.blank?

    min = range[:min] || range["min"]
    max = range[:max] || range["max"]

    {
      min: min.to_f,
      max: max.to_f
    }
  end

  def default_volume_with_dispersion
    {
      min: 0.0,
      max: 0.0
    }
  end
end

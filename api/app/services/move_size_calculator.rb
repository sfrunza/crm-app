class MoveSizeCalculator
  def initialize(move_size, selected_suggested_room_ids: [])
    @move_size = move_size
    @selected_ids = selected_suggested_room_ids.map(&:to_i)
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

  def active_rooms
    defaults = @move_size.move_size_rooms.default_room
    suggested = @move_size.move_size_rooms
                           .suggested_room
                           .where(id: @selected_ids)

    defaults + suggested
  end

  def total_items
    active_rooms.sum(&:total_items)
  end

  def total_boxes
    active_rooms.sum(&:total_boxes)
  end

  def total_volume
    active_rooms.sum(&:total_volume)
  end

  def total_weight
    active_rooms.sum(&:total_weight)
  end

  def volume_with_dispersion
    base = total_volume
    percent = @move_size.dispersion || 0

    {
      min: base - (base * percent / 100.0),
      max: base + (base * percent / 100.0)
    }
  end
end

class MoveSizeRoom < ApplicationRecord
  belongs_to :move_size
  belongs_to :room

  enum :kind, { default_room: 0, suggested_room: 1 }

  def item_quantities
    items || {}
  end

  def total_items
    item_quantities.values.sum
  end

  def total_boxes
    box_ids = Item.where(is_box: true).pluck(:id)

    item_quantities.sum do |item_id, quantity|
      box_ids.include?(item_id.to_i) ? quantity : 0
    end
  end

  def total_volume
    item_records = Item.where(id: item_quantities.keys)

    item_records.sum do |item|
      quantity = item_quantities[item.id.to_s] || 0
      item.volume.to_f * quantity
    end
  end

  def total_weight
    item_records = Item.where(id: item_quantities.keys)

    item_records.sum do |item|
      quantity = item_quantities[item.id.to_s] || 0
      item.weight.to_f * quantity
    end.round(2)
  end
end

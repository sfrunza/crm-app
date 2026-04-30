class MoveSizeRoomSerializer < ActiveModel::Serializer
  attributes :id,
             :room_id,
             :name,
             :items,
             :totals

  def room_id
    object.room.id
  end

  def name
    object.room.name
  end

  def totals
    {
      items: object.total_items,
      boxes: object.total_boxes,
      volume: object.total_volume,
      weight: object.total_weight
    }
  end
end

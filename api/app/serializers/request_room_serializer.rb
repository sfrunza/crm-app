# class RequestRoomSerializer < ActiveModel::Serializer
#   attributes :id,
#              :request_id,
#              :room_id,
#              :name,
#              :is_custom,
#              :position

#   has_many :request_items, serializer: RequestItemSerializer
# end
# class RequestRoomSerializer < ActiveModel::Serializer
#   attributes :id,
#              :room_id,
#              :name,
#              :is_custom,
#              :position,
#              :totals

#   has_many :request_items, serializer: RequestItemSerializer

#   def room_id
#     object.room&.id
#   end

#   def totals
#     {
#       items: object.request_items.sum(&:quantity),
#       boxes: object.request_items.select(&:is_box).sum(&:quantity),
#       volume: object.request_items.sum { |i| (i.volume || 0) * i.quantity },
#       weight: object.request_items.sum { |i| (i.weight || 0) * i.quantity }
#     }
#   end
# end


# app/serializers/request_room_serializer.rb
class RequestRoomSerializer < ActiveModel::Serializer
  attributes :id,
             :room_id,
             :name,
             :is_custom,
             :position,
             :totals
  #  :items,
  #  :custom_items,

  # template items mapping: {item_id => quantity}
  # def items
  #   object.request_items
  # end

  # array of full custom items
  # def custom_items
  #   object.request_items.where(item_id: nil).map do |item|
  #     RequestItemSerializer.new(item, scope: scope, root: false)
  #   end
  # end
  #
  has_many :request_items, serializer: RequestItemSerializer

  # totals for this room
  def totals
    total_items = object.request_items.sum(:quantity)
    total_boxes = object.request_items.where(is_box: true).sum(:quantity)
    total_volume = object.request_items.sum("volume * quantity")
    total_weight = object.request_items.sum("weight * quantity")

    {
      items: total_items,
      boxes: total_boxes,
      volume: total_volume.to_f,
      weight: total_weight.to_f
    }
  end
end

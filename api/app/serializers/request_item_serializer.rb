# class RequestItemSerializer < ActiveModel::Serializer
#   attributes :id,
#              :request_room_id,
#              :item_id,
#              :name,
#              :description,
#              :volume,
#              :weight,
#              :is_box,
#              :is_furniture,
#              :is_special_handling,
#              :is_custom,
#              :quantity
# end

# class RequestItemSerializer < ActiveModel::Serializer
#   attributes :id,
#              :item_id,
#              :name,
#              :description,
#              :volume,
#              :weight,
#              :is_box,
#              :is_furniture,
#              :is_special_handling,
#              :is_custom,
#              :quantity

#   def item_id
#     object.item&.id
#   end
# end



# app/serializers/request_item_serializer.rb
class RequestItemSerializer < ActiveModel::Serializer
  attributes :id,
             :item_id,
             :request_room_id,
             :name,
             :volume,
             :weight,
             :is_box,
             :is_furniture,
             :is_special_handling,
             :quantity,
             :is_custom
end

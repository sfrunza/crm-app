class ItemSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id,
             :name,
             :description,
             :volume,
             :weight,
             :is_box,
             :is_furniture,
             :is_special_handling,
             :position,
             :active,
             :image_url,
             :category_ids

  def category_ids
    object.item_room_categories.pluck(:room_id)
  end

  def image_url
    return unless object.image.attached?

    url_for(object.image)
  end
end

class RoomSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id,
             :name,
             :position,
             :active,
             :image_url

  def image_url
    return unless object.image.attached?

    url_for(object.image)
  end
end

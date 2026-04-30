class MoveSizeSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  include ActionView::Helpers::AssetUrlHelper

  attributes :id,
             :name,
             :description,
             :position,
             :dispersion,
             :truck_count,
             :crew_size_settings,
             :image_url,
             :totals

  has_many :default_rooms, serializer: MoveSizeRoomSerializer
  has_many :suggested_rooms, serializer: MoveSizeRoomSerializer

  def image_url
    url_for(object.image) if object.image.attached?
  end

  def totals
    MoveSizeCalculator.new(object).totals
  end
end

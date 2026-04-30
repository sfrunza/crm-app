class RequestItem < ApplicationRecord
  belongs_to :request_room
  belongs_to :item, optional: true

  validates :name, presence: true
  validates :quantity, numericality: { greater_than: 0 }

  after_commit :delete_room_if_empty

  def total_volume
    volume.to_f * quantity
  end

  def total_weight
    weight.to_f * quantity
  end

  def delete_room_if_empty
    if request_room.persisted? && request_room.request_items.empty?
      request_room.destroy!
    end
  end
end

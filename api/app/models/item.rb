class Item < ApplicationRecord
  # Associations
  has_one_attached :image

  has_many :item_room_categories, dependent: :destroy
  has_many :rooms, through: :item_room_categories

  # Validations
  validates :name, presence: true

  # Callbacks
  normalizes :name, with: ->(name) { name.strip }
  acts_as_list column: :position, top_of_list: 0
end

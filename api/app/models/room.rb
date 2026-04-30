class Room < ApplicationRecord
  # Associations
  has_one_attached :image

  has_many :item_room_categories, dependent: :destroy
  has_many :items, through: :item_room_categories

  has_many :move_size_rooms, dependent: :destroy
  has_many :move_sizes, through: :move_size_rooms

  # Validations
  validates :name, presence: true, uniqueness: true

  # Callbacks
  normalizes :name, with: ->(name) { name.strip }
  acts_as_list column: :position, top_of_list: 0
end

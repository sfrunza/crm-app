class Truck < ApplicationRecord
  # Validations
  validates :name, presence: true, length: { maximum: 255 }

  # Associations
  has_many :request_trucks, dependent: :destroy
  has_many :requests, through: :request_trucks

  has_many :requests_for_date, ->(date) {
    where(moving_date: date)
  }, class_name: "Request"

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  acts_as_list column: :position, top_of_list: 0
  after_commit :clear_cache

  private

  def clear_cache
    Rails.cache.delete(Api::V1::TrucksController::CACHE_KEY)
  end
end

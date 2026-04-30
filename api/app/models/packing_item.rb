class PackingItem < ApplicationRecord
  # Validations
  validates :name, presence: true, length: { maximum: 255 }
  validates :price,
          numericality: {
            greater_than_or_equal_to: 0,
            less_than: 2_147_483_647
          }

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  acts_as_list column: :position, top_of_list: 0
  after_commit :clear_cache

  private

  def clear_cache
    Rails.cache.delete(Api::V1::PackingItemsController::CACHE_KEY)
  end
end

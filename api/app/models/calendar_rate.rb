class CalendarRate < ApplicationRecord
  # Validations
  validates :date, presence: true

  # Associations
  belongs_to :rate, optional: true

  # Callbacks
  after_commit :clear_cache

  private

  def clear_cache
    Rails.cache.delete(Api::V1::CalendarRatesController::CACHE_KEY)
  end
end

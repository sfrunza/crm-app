class Rate < ApplicationRecord
  # Validations
  validates :name, presence: true
  validate :prevent_disabling_default_rate

  # Associations
  has_many :calendar_rates

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  after_update_commit :update_calendar_rates
  after_commit :clear_cache
  before_save :ensure_only_one_default

  private

  def clear_cache
    Rails.cache.delete(Api::V1::RatesController::CACHE_KEY)
  end

  def update_calendar_rates
    return unless saved_change_to_active? && !active

    calendar_rates.destroy_all
    refresh_calendar_rate_cache
  end

  def refresh_calendar_rate_cache
    Rails.cache.delete(Api::V1::CalendarRatesController::CACHE_KEY)
  end

  def prevent_disabling_default_rate
    return unless active_changed? # only check when active is being toggled

    if is_default? && !active
      errors.add(:base, "Cannot disable the default rate")
      throw :abort
    end
  end

  def ensure_only_one_default
    if is_default_changed? && is_default?
      Rate.where.not(id: id).update_all(is_default: false)
    end
  end
end

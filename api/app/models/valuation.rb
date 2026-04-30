class Valuation < ApplicationRecord
  # Validations
  validates :name, presence: true
  validate :prevent_disabling_default_valuation


  # Associations
  has_rich_text :description

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  after_commit :clear_cache
  before_destroy :prevent_default_deletion
  before_save :ensure_only_one_default

  private

  def clear_cache
    Rails.cache.delete(Api::V1::ValuationsController::CACHE_KEY)
  end

  def prevent_default_deletion
    if self.is_default?
      errors.add(:base, "Default valuation cannot be deleted.")
      throw :abort
    end
  end

  def ensure_only_one_default
    return unless is_default_changed? && is_default?
    Valuation.where.not(id: id).update_all(is_default: false)
  end

  def prevent_disabling_default_valuation
    return unless active_changed? # only check when active is being toggled

    if is_default? && !active
      errors.add(:base, "Cannot disable the default valuation")
      throw :abort
    end
  end
end

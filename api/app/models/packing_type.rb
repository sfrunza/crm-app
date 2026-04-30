class PackingType < ApplicationRecord
  # Validations
  validates :name, presence: true, length: { maximum: 255 }
  validates :labor_increase,
            numericality: {
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 100
            }
  validate :prevent_disabling_default

  # Associations
  has_many :requests, dependent: :restrict_with_error
  has_rich_text :description

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  acts_as_list column: :position, top_of_list: 0
  after_commit :clear_cache
  before_destroy :prevent_default_deletion

  before_destroy :reassign_requests_to_default, unless: :is_default?
  before_save :ensure_only_one_default

  private

  def clear_cache
    Rails.cache.delete(Api::V1::PackingTypesController::CACHE_KEY)
  end

  def prevent_default_deletion
    if self.is_default?
      errors.add(:base, "Default packing service cannot be deleted.")
      throw :abort
    end
  end

  def ensure_only_one_default
    return unless is_default_changed? && is_default?

    PackingType.where.not(id: id).update_all(is_default: false)
  end

  def prevent_disabling_default
    return unless is_default_changed? && !is_default?

    errors.add(:base, "Cannot remove default from this packing service. Set another default instead.")
    throw :abort
  end

  def reassign_requests_to_default
    default_pt = PackingType.find_by(is_default: true)

    unless default_pt
      errors.add(:base, "Cannot delete this packing type: no default packing type exists.")
      throw :abort
    end

    requests.update_all(packing_type_id: default_pt.id)
  end
end

class Service < ApplicationRecord
  # Validations
  validates :name, presence: true, uniqueness: true
  validates :code, presence: true, uniqueness: true, format: { with: /\A[a-z0-9_]+\z/ }

  # Associations
  has_many :requests, dependent: :restrict_with_error

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  normalizes :code, with: ->(c) { c.to_s.strip.downcase.tr("-", "_") }
  before_validation :ensure_code
  acts_as_list column: :position, top_of_list: 0
  after_commit :clear_cache
  before_destroy :prevent_default_deletion
  before_destroy :reassign_requests_to_default, unless: :is_default?

  private

  def clear_cache
    Rails.cache.delete(Api::V1::ServicesController::CACHE_KEY)
  end

  def ensure_code
    return if code.present?
    return if name.blank?

    self.code = name.to_s.strip.downcase.tr("-", "_").gsub(/\s+/, "_").gsub(/[^a-z0-9_]/, "")
  end

  def prevent_default_deletion
    if self.is_default?
      errors.add(:base, "Default service cannot be deleted.")
      throw :abort
    end
  end

  def reassign_requests_to_default
    default_service = Service.find_by(is_default: true)

    unless default_service
      errors.add(:base, "Cannot delete this service: no default service exists.")
      throw :abort
    end

    requests.update_all(service_id: default_service.id)
  end
end

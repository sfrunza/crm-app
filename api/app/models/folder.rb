class Folder < ApplicationRecord
  # Validations
  validates :name, presence: true, uniqueness: true
  validate :prevent_disabling_default

  # Associations
  has_many :email_templates, dependent: :nullify

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  acts_as_list column: :position, top_of_list: 0
  after_commit :clear_cache
  before_destroy :prevent_default_deletion
  before_save :ensure_only_one_default
  before_destroy :update_email_templates_folder_id, prepend: true

  private

  def clear_cache
    Rails.cache.delete(Api::V1::FoldersController::CACHE_KEY)
  end

  def update_email_templates_folder_id
    email_templates.update_all(folder_id: Folder.find_by!(is_default: true).id)
    refresh_email_templates_cache
  end

  def refresh_email_templates_cache
    Rails.cache.delete(Api::V1::EmailTemplatesController::CACHE_KEY)
  end

  def prevent_default_deletion
    if self.is_default?
      errors.add(:base, "Default folder cannot be deleted.")
      throw :abort
    end
  end

  def ensure_only_one_default
    return unless is_default_changed? && is_default?

    Folder.where.not(id: id).update_all(is_default: false)
  end

  def prevent_disabling_default
    return unless is_default_changed? && !is_default?

    errors.add(:base, "Cannot remove default from this folder. Set another default instead.")
    throw :abort
  end
end

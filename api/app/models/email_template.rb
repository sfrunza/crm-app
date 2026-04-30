class EmailTemplate < ApplicationRecord
  SYSTEM_EVENT_KEYS = %w[
    manager_new_request
    customer_request_confirmed
    customer_move_reminder_5_days
    customer_move_reminder_1_day
    manager_added_message
    customer_added_message
  ].freeze

  # Validations
  validates :name, presence: true, uniqueness: { scope: :folder_id }
  validates :event_key, uniqueness: true, allow_blank: true
  validates :subject, presence: true

  validate :event_key_is_allowed

  # Associations
  belongs_to :folder

  # Callbacks
  acts_as_list column: :position, top_of_list: 0, scope: :folder
  after_commit :clear_cache
  normalizes :name, with: ->(n) { n.strip }
  normalizes :subject, with: ->(s) { s.strip }
  normalizes :event_key, with: ->(t) { t&.strip.presence }

  private

  def clear_cache
    Rails.cache.delete(Api::V1::EmailTemplatesController::CACHE_KEY)
  end

  def event_key_is_allowed
    return if event_key.blank? || SYSTEM_EVENT_KEYS.include?(event_key)
    errors.add(:base, "Event key is not a valid system event")
    throw :abort
  end
end

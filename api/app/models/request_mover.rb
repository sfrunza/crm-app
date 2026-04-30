class RequestMover < ApplicationRecord
  # Validations
  validates :request_id, presence: true
  validates :user_id, presence: true
  validates :purpose, presence: true, inclusion: { in: %w[pickup delivery] }
  validates :user_id, uniqueness: { scope: [ :request_id, :purpose ], message: "is already assigned to this request for this purpose" }
  validate :user_must_be_mover

  # Associations
  belongs_to :request
  belongs_to :user

  # Callbacks
  after_commit :notify_request_update

  private

  def user_must_be_mover
    return unless user

    unless user.helper? || user.driver? || user.foreman?
      errors.add(:base, "User must be a helper, driver, or foreman")
      throw :abort
    end
  end

  def notify_request_update
    ActionCable.server.broadcast("request_#{request_id}", {
      action: "mover_updated",
      request_id: request_id
    })
  end
end

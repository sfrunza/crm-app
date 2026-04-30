class RequestTruck < ApplicationRecord
  # Validations
  validates :request_id, presence: true
  validates :truck_id, presence: true
  validates :purpose, presence: true, inclusion: { in: %w[pickup delivery] }
  validates :truck_id, uniqueness: { scope: [:request_id, :purpose], message: "is already assigned to this request for this purpose" }

  # Associations
  belongs_to :request
  belongs_to :truck

  # Callbacks
  after_commit :notify_request_update

  private

  def notify_request_update
    ActionCable.server.broadcast("request_#{request_id}", {
      action: "truck_updated",
      request_id: request_id
    })
  end
end

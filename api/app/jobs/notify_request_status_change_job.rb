class NotifyRequestStatusChangeJob < ApplicationJob
  queue_as :default

  def perform(request_id)
    request = Request.find(request_id)
    # Example: Send email notification
    RequestMailer.status_changed(request).deliver_now
  end
end

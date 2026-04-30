class RequestBroadcastService
  def self.call(request, action)
    new(request, action).call
  end

  def initialize(request, action)
    @request = request
    @action = action
  end

  def call
    broadcast_event
  end

  private

  attr_reader :request, :action

  def broadcast_event
    ActionCable.server.broadcast(
      "requests",
      {
        type: event_type,
        id: request.id,
        moving_date: request.moving_date
      }
    )
  end

  def event_type
    action == :create ? "request_created" : "request_updated"
  end
end

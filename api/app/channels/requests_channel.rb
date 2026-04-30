class RequestsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "requests"
  end

  def unsubscribed
    stop_all_streams
  end
end

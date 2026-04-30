class MessagesChannel < ApplicationCable::Channel
  def subscribed
    request = Request.find(params[:request_id])
    stream_from "request_#{request.id}_messages"
  end

  def unsubscribed
    stop_all_streams
  end
end

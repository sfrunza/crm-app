class Api::V1::NotificationsController < ApplicationController
  # GET /api/v1/notifications/unread_messages_count
  # Returns the total number of unread messages across all requests for the current user.
  def unread_messages_count
    user_id = Current.user.id

    count = Message
      .where.not(user_id: user_id)
      .where.not("viewed_by @> ?", [ user_id ].to_json)
      .count

    render json: { count: count }, status: :ok
  end
end

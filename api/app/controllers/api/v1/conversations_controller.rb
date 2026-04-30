class Api::V1::ConversationsController < ApplicationController
  include Pundit::Authorization

  # GET /api/v1/conversations?page=1&per_page=10
  # Returns paginated list of requests that have messages,
  # sorted by: unread first, then by last message time (desc).
  def index
    authorize :conversation, :index?

    user_id = Current.user.id
    per_page = (params[:per_page] || 10).to_i
    page     = (params[:page] || 1).to_i
    offset   = (page - 1) * per_page

    # Subquery: requests with messages, scoped by user role via Pundit
    scoped_requests = RequestPolicy::Scope.new(Current.user, Request).resolve
                                          .joins(:messages)
                                          .distinct

    # Build the conversation rows with aggregated data
    conversations = scoped_requests
      .select(
        "requests.id",
        "requests.status",
        "requests.customer_id",
        "MAX(messages.created_at) AS last_message_at",
        "COUNT(messages.id) FILTER (WHERE messages.user_id != #{ActiveRecord::Base.connection.quote(user_id)} AND NOT messages.viewed_by @> '#{[ user_id ].to_json}') AS unread_count"
      )
      .group("requests.id")
      .order(Arel.sql("unread_count DESC, last_message_at DESC"))
      .limit(per_page)
      .offset(offset)

    total_count = scoped_requests.count

    # Preload customer data and last message content
    request_ids = conversations.map(&:id)
    customers_by_id = User.where(id: conversations.filter_map(&:customer_id)).index_by(&:id)

    # Get last message for each request (single query)
    last_messages = Message
      .where(request_id: request_ids)
      .where(
        "(request_id, created_at) IN (SELECT request_id, MAX(created_at) FROM messages WHERE request_id IN (?) GROUP BY request_id)",
        request_ids
      )
      .index_by(&:request_id)

    items = conversations.map do |conv|
      customer = customers_by_id[conv.customer_id]
      last_msg = last_messages[conv.id]

      {
        id: conv.id,
        status: conv.status,
        customer: customer ? { first_name: customer.first_name, last_name: customer.last_name } : nil,
        last_message: last_msg&.content,
        last_message_at: last_msg&.created_at&.iso8601,
        unread_count: conv.unread_count.to_i
      }
    end

    render json: {
      items: items,
      meta: {
        current_page: page,
        per_page: per_page,
        total_count: total_count,
        total_pages: (total_count.to_f / per_page).ceil
      }
    }, status: :ok
  end
end

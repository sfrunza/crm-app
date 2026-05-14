# frozen_string_literal: true

class Api::V1::OnlineCustomersController < ApplicationController
  # GET /api/v1/online_customers
  # Customers are considered online when at least one of their sessions
  # was active within the last few minutes (see ApplicationController#touch_customer_session_presence).
  def index
    authorize :online_customer, :index?

    threshold = 5.minutes.ago

    online_customer_ids = Session
      .joins(:user)
      .where(users: { role: "customer", active: true })
      .where("sessions.updated_at > ?", threshold)
      .distinct
      .pluck(:user_id)

    last_seen_by_user = Session
      .where(user_id: online_customer_ids)
      .group(:user_id)
      .maximum(:updated_at)

    customers = User
      .where(id: online_customer_ids)
      .includes(requests_as_customer: :service)
      .order(:first_name, :last_name)

    ordered_customers = customers.sort_by do |c|
      last_seen_by_user[c.id] || Time.at(0)
    end.reverse

    payload = ordered_customers.map do |customer|
      requests = customer.requests_as_customer.sort_by(&:updated_at).reverse

      {
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email_address: customer.email_address,
        last_seen_at: last_seen_by_user[customer.id]&.iso8601(3),
        requests: requests.map do |req|
          {
            id: req.id,
            status: req.status,
          }
        end
      }
    end

    render json: { online_customers: payload }, status: :ok
  end
end

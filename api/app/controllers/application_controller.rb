class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods
  include Authentication
  include Pundit::Authorization
  include Pagy::Backend

  after_action :touch_customer_session_presence

  skip_before_action :require_authentication,
                     only: %i[health_check],
                     if: -> { action_name == "health_check" }

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def health_check
    render json: { status: "ok" }
  end

  private

  # Throttled updates so active customer API traffic marks them "online"
  # for staff without writing to the DB on every request.
  def touch_customer_session_presence
    return unless Current.user&.customer?

    sess = Current.session
    return unless sess
    return if sess.updated_at >= 2.minutes.ago

    sess.touch(:updated_at)
  end

  def render_not_found
    render json: { error: "Not found" }, status: :not_found
  end

  def user_not_authorized
    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def pundit_user
    Current.user
  end
end

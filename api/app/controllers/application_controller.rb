class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods
  include Authentication
  include Pundit::Authorization
  include Pagy::Backend

  skip_before_action :require_authentication,
                     only: %i[health_check],
                     if: -> { action_name == "health_check" }

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def health_check
    render json: { status: "ok" }
  end

  private

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

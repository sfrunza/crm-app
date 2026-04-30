class Api::V1::SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[create auto_login]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> {
    render json: { error: "Too many login attempts. Try again later." },
           status: :too_many_requests
  }

  def create
    if user = User.authenticate_by(session_params)
      return render_inactive_account unless user.active?

      start_new_session_for(user)
      render_session_success
    else
      render json: { error: "Invalid email address or password" }, status: :unauthorized
    end
  end

  def auto_login
    user = User.find_by_token_for!(:magic_login, params.require(:magic_token))
    return render_inactive_account unless user.active?

    start_new_session_for(user)
    render_session_success
  rescue ActionController::ParameterMissing
    render json: { error: "magic_token is required" }, status: :unprocessable_content
  rescue ActiveRecord::RecordNotFound, ActiveSupport::MessageVerifier::InvalidSignature
    render json: { error: "Invalid or expired link" }, status: :unauthorized
  end

  def destroy
    terminate_session
    render json: { message: "Logged out" }, status: :ok
  end

  private

  def session_params
    params.permit(:email_address, :password)
  end

  def render_session_success
    render json: { token: Current.session.token, user: session_identity_payload(Current.user) }, status: :ok
  end

  def session_identity_payload(user)
    return {} if user.nil?

    { id: user.id,
      email_address: user.email_address,
      role: user.role }
  end
end

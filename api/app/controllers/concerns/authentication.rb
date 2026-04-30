module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :require_authentication
    # helper_method :authenticated?
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
    end
  end

  private
    def authenticated?
      resume_session
    end

    def require_authentication
      return render_unauthorized unless resume_session
      return if current_user_active?

      terminate_session
      render_inactive_account
    end

    def render_unauthorized
      render json: { error: "Unauthorized" }, status: :unauthorized
    end

    def render_inactive_account
      render json: { error: inactive_account_error_message }, status: :forbidden
    end

    def inactive_account_error_message
      "Your account is not active."
    end

    def current_user_active?
      Current.user&.active?
    end

    def resume_session
      Current.session ||= find_session_by_token
    end

    def find_session_by_token
      authenticate_with_http_token do |token, options|
        Session.find_by(token: token)
      end
    end

    def request_authentication
      session[:return_to_after_authenticating] = request.url
      redirect_to new_session_path
    end

    def after_authentication_url
      session.delete(:return_to_after_authenticating) || root_url
    end

    def start_new_session_for(user)
      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
        Current.session = session
      end
    end

    def terminate_session
      Current.session&.destroy
      Current.session = nil
    end
end

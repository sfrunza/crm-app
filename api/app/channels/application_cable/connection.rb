module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      set_current_user || reject_unauthorized_connection
    end

    private

    def set_current_user
      token = session_token
      return unless token

      session = Session.find_by(token: token)
      return unless session

      unless session.user&.active?
        session.destroy
        return
      end

      self.current_user = session.user
    end

    # Same token resolution as Authentication#find_session_by_token (Bearer / Token header).
    # Browsers cannot set Authorization on the WebSocket handshake, so also allow ?token=.
    def session_token
      pair = ActionController::HttpAuthentication::Token.token_and_options(request)
      token = pair&.first
      token.presence || request.params[:token].presence
    end
  end
end

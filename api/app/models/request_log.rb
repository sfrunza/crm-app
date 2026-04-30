class RequestLog < ApplicationRecord
  belongs_to :request
  belongs_to :user, optional: true

  validates :action, presence: true

  scope :recent, -> { order(created_at: :desc) }

  # Fields to track on Request updates — driven by the unified FIELD_CONFIG
  # in RequestLogResolver (single source of truth for labels, formats, and FK resolvers).
  TRACKED_FIELDS = RequestLogResolver::TRACKED_FIELDS

  # Convenience method for creating logs
  def self.log!(request:, user: nil, action:, details: {}, session:)
    create!(request: request,
     user: user,
      action: action,
      details: details,
      ip_address: session.ip_address,
      device_type: session.device_type,
      browser: session.browser_name,
      platform: session.platform,
      user_agent: session.user_agent,
    )
  end

  def self.log_viewed!(request:, user:, session:)
    return unless user

    recent_exists = where(
      request: request,
      user: user,
      action: "request_viewed"
    ).where("created_at > ?", 30.minutes.ago).exists?

    return if recent_exists

    create!(
      request: request,
      user: user,
      action: "request_viewed",
      details: { request_id: request.id },
      ip_address: session.ip_address,
      device_type: session.device_type,
      browser: session.browser_name,
      platform: session.platform,
      user_agent: session.user_agent,
    )
  end
end

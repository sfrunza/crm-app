class Session < ApplicationRecord
  belongs_to :user
  has_secure_token :token

  before_destroy :invalidate_cache

  def expired?
    created_at < 30.days.ago
  end

  def device_type
    return "unknown" if user_agent.blank?

    browser = Browser.new(user_agent)

    if browser.device.mobile?
      "mobile"
    elsif browser.device.tablet?
      "tablet"
    else
      "desktop"
    end
  end

  def browser_name
    return "unknown" if user_agent.blank?

    Browser.new(user_agent).name
  end

  def platform
    return "unknown" if user_agent.blank?

    Browser.new(user_agent).platform.name
  end

  private

  def invalidate_cache
    Current.reset if Current.session == self
  end
end

class User < ApplicationRecord
  has_secure_password

  attribute :role, :string

  enum :role, {
    customer: "customer",
    helper: "helper",
    driver: "driver",
    foreman: "foreman",
    manager: "manager",
    admin: "admin"
  }, validate: true

  # Associations
  has_many :sessions, dependent: :destroy

  # Request associations
  has_many :requests_as_customer,
           class_name: "Request",
           foreign_key: "customer_id",
           dependent: :restrict_with_error
  has_many :requests_as_foreman,
           class_name: "Request",
           foreign_key: "foreman_id",
           dependent: :restrict_with_error

  # Join table associations for movers assigned to requests
  has_many :request_movers, foreign_key: "user_id", dependent: :destroy
  has_many :assigned_requests, through: :request_movers, source: :request

  # Messages
  has_many :messages, dependent: :destroy

  # Payments
  has_many :payments, dependent: :destroy
  has_many :payment_methods, dependent: :destroy

  # Callbacks
  normalizes :email_address, with: ->(e) { e.strip.downcase }
  normalizes :additional_email, with: -> { _1.presence }
  normalizes :additional_phone, with: -> { _1.presence }
  after_commit :clear_cache

  # Validations
  validates :email_address, presence: true, uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password,
            length: {
              minimum: 6
            },
            if: -> { new_record? || !password.nil? }
  validate :prevent_self_deactivation, on: :update
  validate :role_change_allowed, on: :update

  # Scopes
  scope :active, -> { where(active: true) }

  # Invalidate current token (single-use)
  def invalidate_login_token!
    regenerate_login_token
  end

  # Set token with expiration
  def generate_magic_link!(expires_in: 2.days)
    regenerate_login_token
    update!(login_token_expires_at: Time.current + expires_in)
    login_token
  end

  # Check if token is still valid
  def login_token_valid?(token)
    login_token == token && login_token_expires_at && login_token_expires_at > Time.current
  end

  private

  def role_change_allowed
    return if Current.user&.admin?

    if role_changed? && role != "customer"
      errors.add(:base, "Role cannot be changed")
      throw :abort
    end
  end

  def clear_cache
    Rails.cache.delete(Api::V1::EmployeesController::CACHE_KEY)
  end

  def prevent_self_deactivation
    return unless Current.user.present?
    return unless id == Current.user.id       # same user
    return unless will_save_change_to_active? # user is changing "active"

    errors.add(:base, "You cannot deactivate yourself")
    throw :abort
  end
end

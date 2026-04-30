class Message < ApplicationRecord
  # Validations
  validates :content, presence: true
  validates :request_id, presence: true
  validates :user_id, presence: true

  # Associations
  belongs_to :request
  belongs_to :user

  # Scopes
  scope :ordered, -> { order(created_at: :asc) }
  scope :recent, -> { order(created_at: :desc) }

  # Callbacks
  after_create_commit :broadcast_message
  after_create_commit :log_message_sent
  # after_create_commit :notify_recipients # TODO: uncomment later

  # Instance methods
  def viewed_by?(user)
    viewed_by.include?(user.id)
  end

  def mark_as_viewed_by(user)
    return if viewed_by?(user)

    update(viewed_by: viewed_by + [ user.id ])
    broadcast_viewed
  end

  def notified?(user)
    notified_user_ids.include?(user.id)
  end

  private

  def broadcast_message
    ActionCable.server.broadcast("request_#{request_id}_messages", {
      type: "new_message",
      message: as_json(
        only: [ :id, :content, :request_id, :user_id, :viewed_by, :notified_user_ids, :created_at, :updated_at ],
        include: { user: { only: [ :id, :first_name, :last_name, :role, :email_address ] } }
      )
    })

    broadcast_unread_notifications
  end

  def broadcast_viewed
    ActionCable.server.broadcast("request_#{request_id}_messages", {
      type: "message_viewed",
      message: { id: id, viewed_by: viewed_by }
    })

    broadcast_unread_notifications
  end

  def broadcast_unread_notifications
    # Signal relevant users to refetch their unread count.
    # Covers: the request's customer + all admin/manager users.
    user_ids = User.where(role: [ :admin, :manager ]).pluck(:id)
    user_ids << request.customer_id if request.customer_id.present?

    user_ids.uniq.each do |uid|
      ActionCable.server.broadcast("notifications_user_#{uid}", {
        type: "unread_messages_changed"
      })
    end
  end

  def log_message_sent
    RequestLog.log!(
      request: request,
      user: user,
      action: "message_sent",
      details: {
        message_id: id,
        content_preview: content.truncate(100)
      },
      session: Current.session,
    )
  end

  def notify_recipients
    if user.role.in?(%w[admin manager])
      notify_customer
    elsif user.role == "customer"
      notify_business
    end
  end

  def notify_customer
    customer = request.customer
    return unless customer&.email_address.present?

    template = EmailTemplate.find_by(event_key: "manager_added_message")
    return unless template

    TemplateMailer.send_template(
      recipient: customer.email_address,
      template:  template,
      request:   request,
      extra_variables: { content: content }
    ).deliver_later
  end

  def notify_business
    company_email = Setting.company_email
    return unless company_email.present?

    template = EmailTemplate.find_by(event_key: "customer_added_message")
    return unless template

    TemplateMailer.send_template(
      recipient: company_email,
      template:  template,
      request:   request,
      extra_variables: { content: content }
    ).deliver_later
  end
end

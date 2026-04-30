class InvoiceIndexSerializer < ActiveModel::Serializer
  attributes :id, :username, :status, :amount, :request_id, :date

  def username
    u = object.user
    name = [ u.first_name, u.last_name ].compact.join(" ").strip
    name.presence || u.email_address
  end

  def date
    object.created_at&.iso8601
  end
end

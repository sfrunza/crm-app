class InvoiceSerializer < ActiveModel::Serializer
  attributes :id,
             :request_id,
             :user_id,
             :invoice_number,
             :email,
             :client_name,
             :client_address,
             :amount,
             :subtotal,
             :processing_fee_percent,
             :processing_fee_amount,
             :discount_percent,
             :discount_amount,
             :tax_percent,
             :tax_amount,
             :status,
             :due_date,
             :description,
             :notes,
             :paid_at,
             :sent_at,
             :public_url,
             :created_at,
             :updated_at

  has_many :invoice_items, serializer: InvoiceItemSerializer

  def public_url
    object.public_url
  end

  def due_date
    object.due_date&.iso8601
  end

  def paid_at
    object.paid_at&.iso8601
  end

  def sent_at
    object.sent_at&.iso8601
  end

  def created_at
    object.created_at&.iso8601
  end

  def updated_at
    object.updated_at&.iso8601
  end
end

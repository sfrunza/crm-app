class Invoice < ApplicationRecord
  belongs_to :request
  belongs_to :user

  has_many :invoice_items, -> { order(:position) }, dependent: :destroy

  accepts_nested_attributes_for :invoice_items, allow_destroy: true

  enum :status, {
    draft: 0,
    open: 1,
    paid: 2,
    void: 3
  }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :token, uniqueness: true, allow_nil: true

  before_create :generate_token
  before_create :generate_invoice_number

  scope :for_request, ->(request_id) { where(request_id: request_id) }

  def compute_totals!
    self.subtotal = invoice_items.sum { |item| item.quantity * item.unit_price }
    self.processing_fee_amount = (subtotal * (processing_fee_percent || 0) / 100.0).round
    self.discount_amount = (subtotal * (discount_percent || 0) / 100.0).round
    self.tax_amount = ((subtotal + processing_fee_amount - discount_amount) * (tax_percent || 0) / 100.0).round
    self.amount = subtotal + processing_fee_amount - discount_amount + tax_amount
  end

  def public_url
    "#{ENV["FRONTEND_URL"]}/account/invoice/#{token}"
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(24)
  end

  def generate_invoice_number
    return if invoice_number.present?

    last_number = Invoice.where.not(invoice_number: nil)
                         .order(Arel.sql("CAST(REPLACE(invoice_number, 'INV-', '') AS INTEGER) DESC"))
                         .pick(:invoice_number)

    next_seq = last_number ? last_number.gsub("INV-", "").to_i + 1 : 1001
    self.invoice_number = "INV-#{next_seq}"
  end
end

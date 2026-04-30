class Payment < ApplicationRecord
  belongs_to :request
  belongs_to :user

  enum :payment_type, {
    deposit: 0,
    charge: 1,
    invoice_payment: 2,
    cash: 3,
    check: 4,
    other: 5
  }

  enum :status, {
    pending: 0,
    succeeded: 1,
    failed: 2,
    refunded: 3,
    abandoned: 4
  }

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :payment_type, presence: true
  validates :stripe_payment_intent_id, uniqueness: true, allow_nil: true

  scope :successful, -> { where(status: :succeeded) }
  scope :for_request, ->(request_id) { where(request_id: request_id) }
end

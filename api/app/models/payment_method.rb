class PaymentMethod < ApplicationRecord
  belongs_to :user

  validates :stripe_payment_method_id, presence: true, uniqueness: true
  validates :card_last_four, presence: true
  validates :card_brand, presence: true

  scope :for_user, ->(user_id) { where(user_id: user_id) }

  before_create :ensure_single_default

  private

  def ensure_single_default
    if is_default
      PaymentMethod.where(user_id: user_id, is_default: true).update_all(is_default: false)
    end
  end
end

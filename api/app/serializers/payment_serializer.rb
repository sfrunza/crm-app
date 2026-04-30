class PaymentSerializer < ActiveModel::Serializer
  attributes :id,
             :request_id,
             :user_id,
             :payment_type,
             :amount,
             :status,
             :stripe_payment_intent_id,
             :card_brand,
             :card_last_four,
             :description,
             :refunded_amount,
             :metadata,
             :created_at,
             :updated_at

  def created_at
    object.created_at&.iso8601
  end

  def updated_at
    object.updated_at&.iso8601
  end
end

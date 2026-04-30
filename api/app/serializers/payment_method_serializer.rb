class PaymentMethodSerializer < ActiveModel::Serializer
  attributes :id,
             :user_id,
             :stripe_payment_method_id,
             :card_brand,
             :card_last_four,
             :card_exp_month,
             :card_exp_year,
             :is_default,
             :created_at

  def created_at
    object.created_at&.iso8601
  end
end

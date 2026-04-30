class CancelAbandonedPaymentsJob < ApplicationJob
  queue_as :default

  def perform
    cleanup_payments

    # run again in 5 minutes
    self.class.set(wait: 1.minute).perform_later
  end

  private

  def cleanup_payments
    Payment.pending
      .where("created_at < ?", 10.minutes.ago)
      .where.not(stripe_payment_intent_id: nil)
      .find_each do |payment|
      Stripe::PaymentIntent.cancel(payment.stripe_payment_intent_id)
      payment.update!(status: :abandoned)
    rescue Stripe::InvalidRequestError
      next
    end
  end
end

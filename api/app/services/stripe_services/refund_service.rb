module StripeServices
  class RefundService
    # Issue a full or partial refund for a Stripe payment.
    #
    # @param payment [Payment] the payment to refund
    # @param amount [Integer] amount in cents to refund (nil = full refund)
    # @return [Payment] the updated payment record
    def self.refund(payment:, amount: nil)
      raise "Payment has no Stripe PaymentIntent" unless payment.stripe_payment_intent_id.present?
      raise "Payment is not succeeded" unless payment.succeeded?

      refund_amount = amount || (payment.amount - payment.refunded_amount)
      max_refundable = payment.amount - payment.refunded_amount

      raise "Refund amount exceeds refundable balance" if refund_amount > max_refundable
      raise "Refund amount must be greater than 0" if refund_amount <= 0

      ::Stripe::Refund.create(
        payment_intent: payment.stripe_payment_intent_id,
        amount: refund_amount
      )

      new_refunded = payment.refunded_amount + refund_amount
      new_status = new_refunded >= payment.amount ? :refunded : :succeeded

      payment.update!(
        refunded_amount: new_refunded,
        status: new_status
      )

      payment
    end
  end
end

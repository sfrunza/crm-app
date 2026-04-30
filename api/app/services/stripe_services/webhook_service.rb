module StripeServices
  class WebhookService
    def self.process(event)
      case event.type
      when "payment_intent.succeeded"
        handle_payment_intent_succeeded(event.data.object)
      when "payment_intent.payment_failed"
        handle_payment_intent_failed(event.data.object)
      when "invoice.paid"
        handle_invoice_paid(event.data.object)
      when "invoice.payment_failed"
        handle_invoice_payment_failed(event.data.object)
      when "payment_method.attached"
        handle_payment_method_attached(event.data.object)
      when "payment_method.detached"
        handle_payment_method_detached(event.data.object)
      else
        Rails.logger.info "[Stripe Webhook] Unhandled event type: #{event.type}"
      end
    end

    private_class_method

    def self.handle_payment_intent_succeeded(intent)
      payment = Payment.find_by(stripe_payment_intent_id: intent.id)
      return unless payment

      card_brand = nil
      card_last_four = nil
      begin
        # Use PaymentIntent.retrieve with expand instead of Charge.retrieve (avoid Charges API per Stripe best practices)
        if intent.latest_charge.blank? || intent.latest_charge.is_a?(String)
          intent = ::Stripe::PaymentIntent.retrieve(intent.id, expand: [ "latest_charge" ])
        end
        charge = intent.latest_charge
        if charge.present? && !charge.is_a?(String)
          card_brand = charge.payment_method_details&.card&.brand
          card_last_four = charge.payment_method_details&.card&.last4
        end
      rescue StandardError => e
        Rails.logger.warn "[Stripe Webhook] Could not extract card details from intent: #{e.message}"
      end

      payment.update!(
        status: :succeeded,
        card_brand: card_brand || payment.card_brand,
        card_last_four: card_last_four || payment.card_last_four
      )

      if payment.deposit?
        payment.request.update!(is_deposit_accepted: true, status: "confirmed", booked_at: Time.current)
      end

      # Mark custom invoice as paid if this is an invoice payment
      if payment.invoice_payment? && intent.metadata&.respond_to?(:[])
        invoice_id = intent.metadata["invoice_id"]
        if invoice_id.present?
          invoice = ::Invoice.find_by(id: invoice_id)
          invoice&.update!(status: :paid, paid_at: Time.current) if invoice&.open?
        end
      end

      save_card_from_intent(intent, payment.user)

      broadcast_payment_update(payment)
    end

    def self.handle_payment_intent_failed(intent)
      payment = Payment.find_by(stripe_payment_intent_id: intent.id)
      return unless payment

      payment.update!(status: :failed)
      broadcast_payment_update(payment)
    end

    def self.handle_invoice_paid(stripe_invoice)
      invoice = ::Invoice.find_by(stripe_invoice_id: stripe_invoice.id)
      return unless invoice

      invoice.update!(
        status: :paid,
        paid_at: Time.current,
        stripe_hosted_invoice_url: stripe_invoice.hosted_invoice_url
      )

      # Create a payment record for the invoice payment
      Payment.create!(
        request: invoice.request,
        user: invoice.user,
        payment_type: :invoice_payment,
        amount: invoice.amount,
        status: :succeeded,
        stripe_payment_intent_id: stripe_invoice.payment_intent,
        description: "Invoice ##{invoice.id} payment"
      )

      broadcast_payment_update_for_request(invoice.request)
    end

    def self.handle_invoice_payment_failed(stripe_invoice)
      invoice = ::Invoice.find_by(stripe_invoice_id: stripe_invoice.id)
      return unless invoice

      Rails.logger.warn "[Stripe Webhook] Invoice payment failed: #{stripe_invoice.id}"
    end

    def self.handle_payment_method_attached(stripe_pm)
      meta = stripe_pm.metadata || {}
      user_id = meta["user_id"] || meta[:user_id]
      customer_id = extract_customer_id(stripe_pm.customer)
      user = user_id.present? ? User.find_by(id: user_id) : find_user_by_stripe_customer(customer_id)
      return unless user

      PaymentMethodService.save(
        user: user,
        stripe_payment_method_id: stripe_pm.id,
        is_default: true
      )
    rescue StandardError => e
      Rails.logger.error "[Stripe Webhook] payment_method.attached failed: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.first(5).join("\n")
      # Don't re-raise: card will be saved by payment_intent.succeeded
    end

    def self.handle_payment_method_detached(stripe_pm)
      local_pm = ::PaymentMethod.find_by(stripe_payment_method_id: stripe_pm.id)
      local_pm&.destroy!
    end

    def self.save_card_from_intent(intent, user)
      return unless intent.payment_method.present?

      PaymentMethodService.save(
        user: user,
        stripe_payment_method_id: intent.payment_method.is_a?(String) ? intent.payment_method : intent.payment_method.id,
        is_default: true
      )
    rescue => e
      Rails.logger.error "[Stripe Webhook] Failed to save card from intent: #{e.message}"
    end

    def self.find_user_by_stripe_customer(stripe_customer_id)
      return nil if stripe_customer_id.blank?
      User.find_by(stripe_customer_id: stripe_customer_id)
    end

    def self.extract_customer_id(customer)
      return nil if customer.blank?
      customer.is_a?(String) ? customer : customer.respond_to?(:id) ? customer.id : customer["id"]
    end

    def self.broadcast_payment_update(payment)
      ActionCable.server.broadcast(
        "request_#{payment.request_id}",
        { type: "payment_updated", request_id: payment.request_id, payment_id: payment.id }
      )
    end

    def self.broadcast_payment_update_for_request(request)
      ActionCable.server.broadcast(
        "request_#{request.id}",
        { type: "payment_updated", request_id: request.id }
      )
    end
  end
end

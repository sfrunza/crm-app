module StripeServices
  class PaymentIntentService
    # Create a PaymentIntent for a deposit or direct charge.
    #
    # @param request [Request] the moving request
    # @param user [User] the customer being charged
    # @param amount [Integer] amount in cents
    # @param payment_type [String] "deposit" or "charge"
    # @param payment_method_id [String, nil] Stripe PaymentMethod ID for charging a saved card
    # @param save_card [Boolean] whether to save the card for future use
    # @param description [String, nil] optional description
    # @param invoice_id [Integer, nil] optional invoice ID for invoice payments
    #
    # @return [Hash] { payment: Payment, client_secret: String }
    def self.create(request:, user:, amount:, payment_type:, payment_method_id: nil, save_card:, description: nil, invoice_id: nil)
      stripe_customer_id = CustomerService.find_or_create(user)

      metadata = {
        request_id: request.id,
        user_id: user.id,
        payment_type: payment_type
      }
      metadata[:invoice_id] = invoice_id.to_s if invoice_id.present?

      intent_params = {
        amount: amount,
        currency: "usd",
        customer: stripe_customer_id,
        automatic_payment_methods: { enabled: true },
        metadata: metadata,
        description: description || "#{payment_type.titleize} for Request ##{request.id}"
      }

      if payment_method_id.present?
        # Charging a saved card: confirm immediately off-session
        intent_params[:payment_method] = payment_method_id
        intent_params[:confirm] = true
        intent_params[:off_session] = true
        intent_params[:return_url] = "#{ENV["APP_URL"]}/account/requests/#{request.id}"
      elsif save_card
        # New card: tell Stripe to save it for future off-session use
        intent_params[:setup_future_usage] = "off_session"
      end

      intent_params[:expand] = [ "latest_charge" ]
      intent = ::Stripe::PaymentIntent.create(intent_params)

      payment = Payment.create!(
        request: request,
        user: user,
        payment_type: payment_type,
        amount: amount,
        status: map_intent_status(intent.status),
        stripe_payment_intent_id: intent.id,
        description: description,
        card_brand: extract_card_brand(intent),
        card_last_four: extract_card_last_four(intent)
      )

      { payment: payment, client_secret: intent.client_secret }
    end

    def self.map_intent_status(stripe_status)
      case stripe_status
      when "succeeded"
        :succeeded
      when "requires_payment_method", "requires_confirmation", "requires_action", "processing"
        :pending
      when "canceled"
        :failed
      else
        :pending
      end
    end

    def self.extract_card_brand(intent)
      charge = intent.latest_charge
      return nil if charge.nil? || charge.is_a?(String)

      charge.payment_method_details&.card&.brand
    rescue StandardError
      nil
    end

    def self.extract_card_last_four(intent)
      charge = intent.latest_charge
      return nil if charge.nil? || charge.is_a?(String)

      charge.payment_method_details&.card&.last4
    rescue StandardError
      nil
    end

    # Create a PaymentIntent for an invoice (public pay flow).
    # Centralizes Stripe logic and ensures consistency with best practices.
    #
    # @param invoice [Invoice] the invoice to pay
    # @return [Hash] { payment: Payment, client_secret: String }
    def self.create_for_invoice(invoice:)
      user = invoice.user
      stripe_customer_id = CustomerService.find_or_create(user)

      intent_params = {
        amount: invoice.amount,
        currency: "usd",
        customer: stripe_customer_id,
        automatic_payment_methods: { enabled: true },
        setup_future_usage: "off_session",
        metadata: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          request_id: invoice.request_id,
          user_id: user.id
        },
        description: "Payment for Invoice #{invoice.invoice_number}",
        expand: [ "latest_charge" ]
      }

      intent = ::Stripe::PaymentIntent.create(intent_params)

      payment = Payment.create!(
        request: invoice.request,
        user: user,
        payment_type: :invoice_payment,
        amount: invoice.amount,
        status: map_intent_status(intent.status),
        stripe_payment_intent_id: intent.id,
        description: "Invoice #{invoice.invoice_number} payment",
        card_brand: extract_card_brand(intent),
        card_last_four: extract_card_last_four(intent)
      )

      { payment: payment, client_secret: intent.client_secret }
    end
  end
end

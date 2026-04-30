module StripeServices
  class PaymentMethodService
    # Create a SetupIntent so the frontend can collect card details
    # and save them for future use without charging now.
    #
    # @param user [User] the customer
    # @return [Hash] { client_secret: String }
    def self.create_setup_intent(user)
      stripe_customer_id = CustomerService.find_or_create(user)

      setup_intent = ::Stripe::SetupIntent.create(
        customer: stripe_customer_id,
        automatic_payment_methods: { enabled: true },
        usage: "off_session",
        metadata: { user_id: user.id }
      )

      { client_secret: setup_intent.client_secret }
    end

    # Sync a Stripe PaymentMethod to the local database after
    # a SetupIntent or PaymentIntent saves a card.
    # Only the most recently saved payment method is kept; any existing
    # payment methods for the user are detached and removed.
    #
    # @param user [User]
    # @param stripe_payment_method_id [String]
    # @param is_default [Boolean]
    # @return [PaymentMethod]
    def self.save(user:, stripe_payment_method_id:, is_default: false)
      pm = ::Stripe::PaymentMethod.retrieve(stripe_payment_method_id)
      card_brand = pm.card&.brand
      card_last_four = pm.card&.last4
      return nil if card_brand.blank? || card_last_four.blank?

      # Keep only this payment method: detach and remove any others for this user
      user.payment_methods.where.not(stripe_payment_method_id: stripe_payment_method_id).find_each do |old_pm|
        detach(old_pm)
      end

      record = ::PaymentMethod.find_or_create_by!(
        user: user,
        stripe_payment_method_id: stripe_payment_method_id
      ) do |r|
        r.card_brand = card_brand
        r.card_last_four = card_last_four
        r.card_exp_month = pm.card&.exp_month
        r.card_exp_year = pm.card&.exp_year
        r.is_default = is_default
      end
      # Ensure is_default when found (block only runs on create)
      record.update!(is_default: is_default) if is_default && !record.is_default?
      record
    end

    # Detach a payment method from the Stripe customer and remove locally.
    # Resilient to "already detached" (e.g. when payment_intent.succeeded and
    # payment_method.attached both fire and race to detach the same old cards).
    #
    # @param payment_method [PaymentMethod]
    def self.detach(payment_method)
      begin
        ::Stripe::PaymentMethod.detach(payment_method.stripe_payment_method_id)
      rescue ::Stripe::InvalidRequestError => e
        # Already detached by concurrent webhook - still clean up locally
        raise unless e.message.to_s.include?("detached")
        Rails.logger.info "[Stripe] PaymentMethod #{payment_method.stripe_payment_method_id} already detached"
      end
      payment_method.destroy!
    end

    # List all payment methods for a user from local DB.
    #
    # @param user [User]
    # @return [ActiveRecord::Relation]
    def self.list(user)
      user.payment_methods.order(is_default: :desc, created_at: :desc)
    end
  end
end

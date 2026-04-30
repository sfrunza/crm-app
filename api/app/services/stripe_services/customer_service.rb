module StripeServices
  class CustomerService
    # Find or create a Stripe Customer for the given user.
    # Lazily creates the Stripe customer on first use and
    # persists the stripe_customer_id on the user record.
    def self.find_or_create(user)
      return user.stripe_customer_id if user.stripe_customer_id.present?

      customer = ::Stripe::Customer.create(
        email: user.email_address,
        name: [ user.first_name, user.last_name ].compact.join(" "),
        phone: user.phone,
        metadata: { user_id: user.id }
      )

      user.update!(stripe_customer_id: customer.id)
      customer.id
    end

    def self.retrieve(user)
      return nil unless user.stripe_customer_id.present?

      ::Stripe::Customer.retrieve(user.stripe_customer_id)
    end
  end
end

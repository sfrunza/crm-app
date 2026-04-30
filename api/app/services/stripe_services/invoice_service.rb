module StripeServices
  class InvoiceService
    # Create and optionally send a Stripe Invoice for a request.
    #
    # @param request [Request] the moving request
    # @param user [User] the customer to invoice
    # @param amount [Integer] amount in cents
    # @param description [String] line item description
    # @param due_date [Date, nil] invoice due date
    # @param auto_send [Boolean] whether to finalize and send immediately
    #
    # @return [Invoice] the local Invoice record
    def self.create(request:, user:, amount:, description:, due_date: nil, auto_send: true)
      stripe_customer_id = CustomerService.find_or_create(user)

      stripe_invoice = ::Stripe::Invoice.create(
        customer: stripe_customer_id,
        collection_method: "send_invoice",
        days_until_due: due_date ? (due_date - Date.current).to_i.clamp(1, 365) : 7,
        metadata: {
          request_id: request.id,
          user_id: user.id
        }
      )

      ::Stripe::InvoiceItem.create(
        customer: stripe_customer_id,
        invoice: stripe_invoice.id,
        amount: amount,
        currency: "usd",
        description: description
      )

      if auto_send
        stripe_invoice = ::Stripe::Invoice.finalize_invoice(stripe_invoice.id)
        stripe_invoice = ::Stripe::Invoice.send_invoice(stripe_invoice.id)
      end

      invoice = ::Invoice.create!(
        request: request,
        user: user,
        amount: amount,
        status: auto_send ? :open : :draft,
        stripe_invoice_id: stripe_invoice.id,
        stripe_hosted_invoice_url: stripe_invoice.hosted_invoice_url,
        due_date: due_date || 7.days.from_now.to_date,
        description: description,
        sent_at: auto_send ? Time.current : nil
      )

      invoice
    end

    # Void an existing invoice.
    def self.void(invoice)
      return invoice if invoice.void? || invoice.paid?

      ::Stripe::Invoice.void_invoice(invoice.stripe_invoice_id) if invoice.stripe_invoice_id.present?
      invoice.update!(status: :void)
      invoice
    end
  end
end

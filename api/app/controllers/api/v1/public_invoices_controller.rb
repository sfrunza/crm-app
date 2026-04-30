class Api::V1::PublicInvoicesController < ApplicationController
  allow_unauthenticated_access only: %i[show pay]
  skip_before_action :require_authentication, only: %i[show pay], raise: false

  # GET /api/v1/invoices/:token
  #
  # Public endpoint to view an invoice by its token.
  # No authentication required -- the token acts as the access key.
  def show
    invoice = Invoice.includes(:invoice_items).find_by!(token: params[:token])

    render json: {
      invoice: InvoiceSerializer.new(invoice).as_json,
      company: {
        name: Setting.company_name,
        address: Setting.company_address,
        phone: Setting.company_phone,
        email: Setting.company_email
      }
    }
  end

  # POST /api/v1/invoices/:token/pay
  #
  # Creates a Stripe PaymentIntent for the invoice amount.
  # Returns the client_secret for the frontend to confirm the payment.
  def pay
    invoice = Invoice.find_by!(token: params[:token])

    return render json: { error: "Invoice is not open" }, status: :unprocessable_entity unless invoice.open?
    return render json: { error: "Invoice has no amount" }, status: :unprocessable_entity unless invoice.amount > 0

    result = StripeServices::PaymentIntentService.create_for_invoice(invoice: invoice)

    render json: {
      client_secret: result[:client_secret],
      payment_id: result[:payment].id
    }
  end
end

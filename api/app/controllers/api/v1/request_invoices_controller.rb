class Api::V1::RequestInvoicesController < ApplicationController
  before_action :set_request

  def index
    invoices = @request.invoices.includes(:invoice_items).order(created_at: :desc)
    authorize invoices.first || Invoice.new(request: @request)
    render json: invoices, each_serializer: InvoiceSerializer
  end

  # POST /api/v1/requests/:request_id/invoices
  #
  # Creates a custom invoice with line items, fees, discounts, and tax.
  # Sends an email to the customer with a payment link.
  def create
    authorize Invoice.new(request: @request)

    customer = @request.customer
    return render json: { error: "Request has no customer" }, status: :unprocessable_entity unless customer

    invoice = @request.invoices.build(
      user: customer,
      email: invoice_params[:email],
      client_name: invoice_params[:client_name],
      client_address: invoice_params[:client_address],
      description: invoice_params[:description],
      notes: invoice_params[:notes],
      due_date: invoice_params[:due_date]&.to_date || 7.days.from_now.to_date,
      processing_fee_percent: invoice_params[:processing_fee_percent] || 0,
      discount_percent: invoice_params[:discount_percent] || 0,
      tax_percent: invoice_params[:tax_percent] || 0,
      status: :open
    )

    # Build line items
    if invoice_params[:items].present?
      invoice_params[:items].each_with_index do |item, idx|
        invoice.invoice_items.build(
          description: item[:description],
          quantity: item[:quantity].to_i,
          unit_price: item[:unit_price].to_i,
          position: idx
        )
      end
    end

    # Allow custom override of fee/discount/tax amounts
    invoice.compute_totals!

    # Override computed amounts if custom values provided
    if invoice_params[:processing_fee_amount].present?
      invoice.processing_fee_amount = invoice_params[:processing_fee_amount].to_i
    end
    if invoice_params[:discount_amount].present?
      invoice.discount_amount = invoice_params[:discount_amount].to_i
    end
    if invoice_params[:tax_amount].present?
      invoice.tax_amount = invoice_params[:tax_amount].to_i
    end

    # Recompute total after overrides
    invoice.amount = invoice.subtotal +
                     invoice.processing_fee_amount -
                     invoice.discount_amount +
                     invoice.tax_amount

    invoice.save!

    # Send invoice email
    if invoice.email.present?
      InvoiceMailer.send_invoice(invoice).deliver_later
      invoice.update!(sent_at: Time.current)
    end

    render json: invoice, serializer: InvoiceSerializer, status: :created
  end

  # POST /api/v1/requests/:request_id/invoices/:id/void
  def void
    invoice = @request.invoices.find(params[:id])
    authorize invoice

    invoice.update!(status: :void)
    render json: invoice.reload, serializer: InvoiceSerializer
  end

  # POST /api/v1/requests/:request_id/invoices/:id/send_email
  def send_email
    invoice = @request.invoices.find(params[:id])
    authorize invoice

    email = params[:email] || invoice.email
    return render json: { error: "No email address" }, status: :unprocessable_entity unless email.present?

    invoice.update!(email: email) if email != invoice.email
    InvoiceMailer.send_invoice(invoice).deliver_later
    invoice.update!(sent_at: Time.current)

    render json: invoice, serializer: InvoiceSerializer
  end

  private

  def set_request
    @request = Request.find(params[:request_id])
  end

  def invoice_params
    params.require(:invoice).permit(
      :email, :client_name, :client_address, :description, :notes,
      :due_date, :processing_fee_percent, :processing_fee_amount,
      :discount_percent, :discount_amount, :tax_percent, :tax_amount,
      items: %i[description quantity unit_price]
    )
  end
end

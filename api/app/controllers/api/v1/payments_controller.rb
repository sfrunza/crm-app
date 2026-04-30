class Api::V1::PaymentsController < ApplicationController
  before_action :set_request

  def index
    payments = @request.payments.order(created_at: :desc)
    authorize payments.first || Payment.new(request: @request)
    render json: payments, each_serializer: PaymentSerializer
  end

  def show
    payment = @request.payments.find(params[:id])
    authorize payment
    render json: payment, serializer: PaymentSerializer
  end

  # POST /api/v1/requests/:request_id/payments
  #
  # Creates a payment. For card-based payments, creates a Stripe PaymentIntent.
  # For cash/check/other, records the payment directly.
  #
  # Params:
  #   amount: Integer (cents, required)
  #   payment_type: String ("deposit"|"charge"|"cash"|"check"|"other", required)
  #   payment_method_id: String (optional, Stripe PM id for charging saved card)
  #   description: String (optional)
  #   save_card: Boolean (optional, default true)
  #   check_number: String (optional, for check payments)
  #   notes: String (optional, for check/other payments)
  def create
    authorize Payment.new(request: @request)

    customer = @request.customer
    return render json: { error: "Request has no customer" }, status: :unprocessable_entity unless customer

    ptype = payment_params[:payment_type]

    if ptype.in?(%w[cash check other])
      create_offline_payment(customer, ptype)
    else
      create_stripe_payment(customer, ptype)
    end
  end

  # POST /api/v1/requests/:request_id/payments/:id/confirm
  #
  # Syncs a pending payment's status from Stripe.
  # Called by the frontend after stripe.confirmPayment() succeeds,
  # so the UI doesn't have to wait for the webhook.
  def confirm
    payment = @request.payments.find(params[:id])
    authorize payment

    if payment.stripe_payment_intent_id.present? && payment.pending?
      intent = ::Stripe::PaymentIntent.retrieve({
        id: payment.stripe_payment_intent_id,
        expand: [ "latest_charge" ]
      })

      card_brand = nil
      card_last_four = nil

      if intent.latest_charge.present? && !intent.latest_charge.is_a?(String)
        card_brand = intent.latest_charge.payment_method_details&.card&.brand
        card_last_four = intent.latest_charge.payment_method_details&.card&.last4
      end

      payment.update!(
        status: StripeServices::PaymentIntentService.map_intent_status(intent.status),
        card_brand: card_brand || payment.card_brand,
        card_last_four: card_last_four || payment.card_last_four
      )

      # if payment.succeeded? && payment.deposit?
      #   @request.update!(is_deposit_accepted: true, status: "confirmed")
      # end

      # Save card on file as a backup (in case webhook hasn't fired yet)
      StripeServices::WebhookService.save_card_from_intent(intent, @request.customer) if payment.succeeded?
    end

    render json: payment, serializer: PaymentSerializer
  end

  # POST /api/v1/requests/:request_id/payments/:id/refund
  #
  # Issues a full or partial Stripe refund.
  #
  # Params:
  #   amount: Integer (cents, optional -- omit for full refund)
  def refund
    payment = @request.payments.find(params[:id])
    authorize payment

    refund_amount = params[:amount].present? ? params[:amount].to_i : nil

    payment = StripeServices::RefundService.refund(
      payment: payment,
      amount: refund_amount
    )

    render json: payment, serializer: PaymentSerializer
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def create_offline_payment(customer, ptype)
    meta = {}
    meta[:check_number] = payment_params[:check_number] if payment_params[:check_number].present?
    meta[:notes] = payment_params[:notes] if payment_params[:notes].present?

    payment = Payment.create!(
      request: @request,
      user: customer,
      payment_type: ptype,
      amount: payment_params[:amount].to_i,
      status: :succeeded,
      description: payment_params[:description],
      metadata: meta
    )

    if ptype == "deposit" || payment_params[:is_deposit]
      @request.update!(is_deposit_accepted: true, status: "confirmed", booked_at: Time.current)
    end

    render json: {
      payment: PaymentSerializer.new(payment).as_json,
      client_secret: nil
    }, status: :created
  end

  def create_stripe_payment(customer, ptype)
    result = StripeServices::PaymentIntentService.create(
      request: @request,
      user: customer,
      amount: payment_params[:amount].to_i,
      payment_type: ptype,
      payment_method_id: payment_params[:payment_method_id],
      save_card: payment_params[:save_card],
      description: payment_params[:description],
      invoice_id: payment_params[:invoice_id]
    )

    if ptype == "deposit" || payment_params[:is_deposit]
      @request.update!(is_deposit_accepted: true, status: "reserved", booked_at: Time.current)
    end

    render json: {
      payment: PaymentSerializer.new(result[:payment]).as_json,
      client_secret: result[:client_secret]
    }, status: :created
  end

  def set_request
    @request = Request.find(params[:request_id])
  end

  def payment_params
    params.require(:payment).permit(
      :amount, :payment_type, :payment_method_id,
      :description, :save_card, :check_number, :notes, :is_deposit, :invoice_id
    )
  end
end

class Api::V1::WebhooksController < ApplicationController
  allow_unauthenticated_access only: [ :stripe ]
  skip_before_action :require_authentication, only: [ :stripe ], raise: false

  # POST /api/v1/webhooks/stripe
  def stripe
    payload = request.body.read
    sig_header = request.env["HTTP_STRIPE_SIGNATURE"]
    endpoint_secret = ENV["STRIPE_WEBHOOK_SECRET"]

    begin
      event = ::Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
    rescue JSON::ParserError
      render json: { error: "Invalid payload" }, status: :bad_request and return
    rescue ::Stripe::SignatureVerificationError
      render json: { error: "Invalid signature" }, status: :bad_request and return
    end

    StripeServices::WebhookService.process(event)

    head :ok
  rescue StandardError => e
    Rails.logger.error "[Stripe Webhook] #{event&.type}: #{e.class} - #{e.message}"
    Rails.logger.error e.backtrace.first(15).join("\n")
    raise
  end
end

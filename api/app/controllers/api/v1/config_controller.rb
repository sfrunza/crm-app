class Api::V1::ConfigController < ApplicationController
  allow_unauthenticated_access only: [ :stripe ]

  # GET /api/v1/config/stripe
  #
  # Returns the Stripe publishable key for frontend initialization.
  def stripe
    render json: {
      publishable_key: ENV["STRIPE_PUBLISHABLE_KEY"]
    }
  end
end

class Api::V1::PaymentMethodsController < ApplicationController
  # GET /api/v1/payment_methods?user_id=:id
  #
  # Lists all saved payment methods (cards on file) for a user.
  # Admin/manager can pass user_id param. Customers see only their own.
  def index
    target_user = resolve_target_user
    authorize ::PaymentMethod.new(user: target_user)

    payment_methods = StripeServices::PaymentMethodService.list(target_user)
    render json: payment_methods, each_serializer: PaymentMethodSerializer
  end

  # POST /api/v1/payment_methods
  #
  # Creates a Stripe SetupIntent so the frontend can collect card details.
  # Returns the client_secret for Stripe.js confirmCardSetup.
  #
  # Params:
  #   user_id: Integer (optional for admin/manager, defaults to current user)
  def create
    target_user = resolve_target_user
    authorize ::PaymentMethod.new(user: target_user)

    result = StripeServices::PaymentMethodService.create_setup_intent(target_user)
    render json: result, status: :created
  end

  # DELETE /api/v1/payment_methods/:id
  #
  # Detaches a payment method from Stripe and removes the local record.
  def destroy
    payment_method = ::PaymentMethod.find(params[:id])
    authorize payment_method

    StripeServices::PaymentMethodService.detach(payment_method)
    head :no_content
  end

  private

  def resolve_target_user
    if params[:user_id].present? && Current.user.role.in?(%w[admin manager foreman])
      User.find(params[:user_id])
    else
      Current.user
    end
  end
end

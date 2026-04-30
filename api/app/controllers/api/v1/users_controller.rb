class Api::V1::UsersController < ApplicationController
  include Pundit::Authorization
  before_action :set_user, only: %i[ show update ]

  def create
    @user = User.new(user_params)
    authorize @user

    if @user.save
      # broadcast_customer_update(@user)
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def me
    render json: Current.user, serializer: UserSerializer, status: :ok
  end

  # GET /api/v1/users/:id
  def show
    authorize @user
    render json: @user, status: :ok
  end

  def update
    authorize @user

    if @user.update(user_params)
      broadcast_customer_update(@user)
      render json: @user.as_json(except: %i[password_digest])
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # GET /api/v1/users/:id/requests
  def find_by_email
    authorize User, :find_by_email?

    email_address = params[:email_address]
    user = User.find_by(email_address: email_address, role: "customer")
    render json: user, status: :ok
  end

  def me
    render json: Current.user, serializer: UserSerializer, status: :ok
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
     params.expect(
      user: %i[
        first_name
        last_name
        email_address
        additional_email
        phone
        additional_phone
        password
      ]
    )
  end

  def broadcast_customer_update(user)
    ActionCable.server.broadcast(
      "requests",
      {
        type: "customer_updated",
        customer_id: user.id
      }
    )
  end
end

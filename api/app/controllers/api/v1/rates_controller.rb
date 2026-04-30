class Api::V1::RatesController < ApplicationController
  include Pundit::Authorization
  before_action :set_rate, only: %i[update]

  CACHE_KEY = "#{Rails.env}/rates_v1"

  # GET /rates
  def index
    @rates = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rate.order(:id)
    end

    Rails.logger.info "[CACHE] HIT: returning cached rates"
    render json: @rates, status: :ok
  end

  # POST /rates
  def create
    @rate = Rate.new(rate_params)
    authorize @rate

    if @rate.save
      render json: @rate, status: :created
    else
      render json: @rate.errors.full_messages, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /rates/1
  def update
    authorize @rate

    if @rate.update(rate_params.permit(:extra_mover_rate, :extra_truck_rate, :active, :name, :color, movers_rates: %i[hourly_rate]))
      render json: @rate
    else
      render json: @rate.errors, status: :unprocessable_entity
    end
  end

  private

  def set_rate
    @rate = Rate.find(params.expect(:id))
  end

  def rate_params
    params.expect(
      rate: [ :extra_mover_rate, :extra_truck_rate, :active, :name, :color, :is_default, movers_rates: [ [ :hourly_rate ] ] ]
    )
  end
end

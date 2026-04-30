class Api::V1::ValuationsController < ApplicationController
  include Pundit::Authorization
  before_action :set_valuation, only: %i[ update destroy ]

  CACHE_KEY = "#{Rails.env}/valuations_v1"

  # GET /packing_types
  def index
    @valuations = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh valuations"
      Valuation.order(:id).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached valuations"
    render json: @valuations, status: :ok
  end


  # POST /services
  def create
    @valuation = Valuation.new(valuation_params)
    authorize @valuation

    if @valuation.save
      render json: @valuation, status: :created
    else
      render json: @valuation.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /services/1
  def update
    authorize @valuation

    if @valuation.update(valuation_params)
      render json: @valuation
    else
      render json: @valuation.errors, status: :unprocessable_content
    end
  end

  # DELETE /services/1
  def destroy
    authorize @valuation
    @valuation.destroy!

    head :no_content
  rescue ActiveRecord::RecordNotDestroyed
    render json: @valuation.errors, status: :unprocessable_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_valuation
      @valuation = Valuation.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def valuation_params
      params.expect(valuation: [ :name, :description, :is_default, :active ])
    end
end

class Api::V1::PackingTypesController < ApplicationController
  include Pundit::Authorization
  before_action :set_packing_type, only: %i[ update destroy ]

  CACHE_KEY = "#{Rails.env}/packing_types_v1"

  # GET /packing_types
  def index
    @packing_types = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh packing types"
      PackingType.order(:position).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached packing types"
    render json: @packing_types, status: :ok
  end


  # POST /services
  def create
    @packing_type = PackingType.new(packing_type_params)
    authorize @packing_type

    if @packing_type.save
      render json: @packing_type, status: :created
    else
      render json: @packing_type.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /services/1
  def update
    authorize @packing_type

    if @packing_type.update(packing_type_params)
      render json: @packing_type
    else
      render json: @packing_type.errors, status: :unprocessable_content
    end
  end

  # DELETE /services/1
  def destroy
    authorize @packing_type
    @packing_type.destroy!

    head :no_content
  rescue ActiveRecord::RecordNotDestroyed
    render json: @packing_type.errors, status: :unprocessable_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_packing_type
      @packing_type = PackingType.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def packing_type_params
      params.expect(packing_type: [ :name, :description, :is_default, :labor_increase, :position ])
    end
end

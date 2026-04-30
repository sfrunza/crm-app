class Api::V1::EntranceTypesController < ApplicationController
  include Pundit::Authorization
  before_action :set_entrance_type, only: %i[ update destroy ]

  CACHE_KEY = "#{Rails.env}/entrance_types_v1"

  # GET /entrance_types
  def index
    @entrance_types = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh entrance types"
      EntranceType.order(:position).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached entrance types"
    render json: @entrance_types, status: :ok
  end


  # POST /entrance_types
  def create
    @entrance_type = EntranceType.new(entrance_type_params)
    authorize @entrance_type

    if @entrance_type.save
      render json: @entrance_type, status: :created
    else
      render json: @entrance_type.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /entrance_types/1
  def update
    authorize @entrance_type

    if @entrance_type.update(entrance_type_params)
      render json: @entrance_type
    else
      render json: @entrance_type.errors, status: :unprocessable_content
    end
  end

  # DELETE /entrance_types/1
  def destroy
    authorize @entrance_type
    @entrance_type.destroy!

    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_entrance_type
      @entrance_type = EntranceType.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def entrance_type_params
      params.expect(entrance_type: [ :name, :form_name, :position ])
    end
end

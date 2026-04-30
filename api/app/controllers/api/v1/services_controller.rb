class Api::V1::ServicesController < ApplicationController
  include Pundit::Authorization
  before_action :set_service, only: %i[ update destroy ]

  CACHE_KEY = "#{Rails.env}/services_v1"

  # GET /services
  def index
    @services = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh services"
      Service.order(:position).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached services"
    render json: @services, status: :ok
  end


  # POST /services
  def create
    @service = Service.new(service_params)
    authorize @service

    if @service.save
      render json: @service, status: :created
    else
      render json: @service.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /services/1
  def update
    authorize @service

    if @service.update(service_params)
      render json: @service
    else
      render json: @service.errors, status: :unprocessable_content
    end
  end

  # DELETE /services/1
  def destroy
    authorize @service
    @service.destroy!

    head :no_content
  rescue ActiveRecord::RecordNotDestroyed
    render json: @service.errors, status: :unprocessable_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_service
      @service = Service.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def service_params
      params.expect(service: [ :name, :code, :active, :miles_setting, :position, :is_default ])
    end
end

class Api::V1::ExtraServicesController < ApplicationController
  include Pundit::Authorization
  before_action :set_extra_service, only: %i[ update destroy ]

  CACHE_KEY = "#{Rails.env}/extra_services_v1"

  # GET /extra_services
  def index
    @extra_services = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh extra services"
      ExtraService.order(:position).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached extra services"
    render json: @extra_services, status: :ok
  end

  # POST /extra_services
  def create
    @extra_service = ExtraService.new(extra_service_params)
    authorize @extra_service

    if @extra_service.save
      render json: @extra_service, status: :created
    else
      render json: @extra_service.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /extra_services/1
  def update
    authorize @extra_service

    if @extra_service.update(extra_service_params)
      render json: @extra_service
    else
      render json: @extra_service.errors, status: :unprocessable_entity
    end
  end

  # DELETE /extra_services/1
  def destroy
    authorize @extra_service
    @extra_service.destroy!

    head :no_content
  end

  private

  def set_extra_service
    @extra_service = ExtraService.find(params.expect(:id))
  end

  def extra_service_params
    params.expect(extra_service: [ :name, :price, :active, :position ])
  end
end

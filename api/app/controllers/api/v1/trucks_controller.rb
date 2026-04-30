class Api::V1::TrucksController < ApplicationController
  include Pundit::Authorization
  before_action :set_truck, only: %i[ update ]

  CACHE_KEY = "#{Rails.env}/trucks_v1"

  # GET /services
  def index
    @trucks = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh trucks"
      Truck.order(:position).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached trucks"
    render json: @trucks, status: :ok
  end


  # POST /services
  def create
    @truck = Truck.new(truck_params)
    authorize @truck

    if @truck.save
      render json: @truck, status: :created
    else
      render json: @truck.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /services/1
  def update
    authorize @truck

    if @truck.update(truck_params)
      render json: @truck
    else
      render json: @truck.errors, status: :unprocessable_content
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_truck
      @truck = Truck.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def truck_params
      params.expect(truck: [ :name, :active, :position ])
    end
end

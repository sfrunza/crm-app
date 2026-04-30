class Api::V1::PackingItemsController < ApplicationController
  include Pundit::Authorization
  before_action :set_packing_item, only: %i[ update destroy ]

  CACHE_KEY = "#{Rails.env}/packing_items_v1"

  # GET /packing_items
  def index
    @packing_items = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh packing items"
      PackingItem.order(:position).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached packing items"
    render json: @packing_items, status: :ok
  end


  # POST /services
  def create
    @packing_item = PackingItem.new(packing_item_params)
    authorize @packing_item

    if @packing_item.save
      render json: @packing_item, status: :created
    else
      render json: @packing_item.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /services/1
  def update
    authorize @packing_item

    if @packing_item.update(packing_item_params)
      render json: @packing_item
    else
      render json: @packing_item.errors, status: :unprocessable_content
    end
  end

  # DELETE /services/1
  def destroy
    authorize @packing_item
    @packing_item.destroy!

    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_packing_item
      @packing_item = PackingItem.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def packing_item_params
      params.expect(packing_item: [ :name, :price, :position ])
    end
end

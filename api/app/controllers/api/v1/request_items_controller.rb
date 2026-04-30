class Api::V1::RequestItemsController < ApplicationController
  # include Pundit::Authorization
  before_action :set_request
  before_action :set_request_room, only: [ :index, :create ]
  before_action :set_request_item, only: [ :update, :destroy ]

  def index
    items = @request_room.request_items
    render json: items
  end

  def create
    item = @request_room.request_items.new(item_params)
    # authorize item

    if item.save
      RequestInventorySyncService.call(@request)
      render json: item, status: :created
    else
      render json: item.errors, status: :unprocessable_content
    end
  end

  def update
    # authorize item

    if @request_item.update(item_params)
      RequestInventorySyncService.call(@request)
      render json: @request_item
    else
      render json: @request_item.errors, status: :unprocessable_content
    end
  end

  def destroy
    @request_item.destroy!
    RequestInventorySyncService.call(@request)
    head :no_content
  end

  private

  def set_request
    @request = Request.find(params.expect(:request_id))
  end

  def set_request_room
    @request_room = @request.request_rooms.find(params.expect(:request_room_id))
  end

  # Used for update/destroy/show — finds by ID only, not scoped to room
  def set_request_item
    @request_item = RequestItem.find(params[:id])
    raise ActiveRecord::RecordNotFound if @request_item.request_room.request_id != @request.id
  end

  def item_params
    params.expect(request_item: [
      :name,
      :description,
      :item_id,
      :volume,
      :weight,
      :is_box,
      :is_furniture,
      :is_special_handling,
      :is_custom,
      :quantity
    ])
  end
end

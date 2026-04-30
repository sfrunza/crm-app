class Api::V1::RequestRoomsController < ApplicationController
  # include Pundit::Authorization
  before_action :set_request

  def index
    rooms = @request.request_rooms
    render json: rooms
  end

  def show
    room = @request.request_rooms.find(params.expect(:id))
    render json: room
  end

  def create
    room = @request.request_rooms.new(room_params)
    # authorize room

    if room.save
      RequestInventorySyncService.call(@request)
      render json: room, status: :created
    else
      render json: room.errors, status: :unprocessable_content
    end
  end

  def update
    room = @request.request_rooms.find(params.expect(:id))
    # authorize room

    if room.update(room_params)
      RequestInventorySyncService.call(@request)
      render json: room
    else
      render json: room.errors, status: :unprocessable_content
    end
  end

  def destroy
    room = @request.request_rooms.find(params.expect(:id))
    # authorize room
    room.destroy!
    RequestInventorySyncService.call(@request)
    head :no_content
  end

  private

  def set_request
    @request = Request.find(params.expect(:request_id))
  end

  def room_params
    params.expect(request_room: [ :name, :room_id, :is_custom, :position ])
  end
end

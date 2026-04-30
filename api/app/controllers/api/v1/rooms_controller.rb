class Api::V1::RoomsController < ApplicationController
  include Pundit::Authorization
  before_action :set_room, only: %i[update destroy]

  def index
    render json: Room.includes(image_attachment: :blob).order(:position), status: :ok
  end

  def create
    room = Room.new(room_params.except(:remove_image))
    authorize room

    if room.save
      render json: room, status: :created
    else
      render json: room.errors, status: :unprocessable_content
    end
  end

  def update
    authorize @room

    if ActiveModel::Type::Boolean.new.cast(room_params[:remove_image])
      @room.image.purge_later
    end

    if @room.update(room_params.except(:remove_image))
      render json: @room
    else
      render json: @room.errors, status: :unprocessable_content
    end
  end

  def destroy
    authorize @room
    @room.destroy!
    head :no_content
  end

  private

  def set_room
    @room = Room.find(params.expect(:id))
  end

  def room_params
    params.expect(room: [ :name, :position, :active, :image, :remove_image ])
  end
end

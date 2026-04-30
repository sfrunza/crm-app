class Api::V1::MoveSizesController < ApplicationController
  include Pundit::Authorization
  allow_unauthenticated_access only: %i[index]
  before_action :set_move_size, only: %i[update destroy]

  CACHE_KEY = "#{Rails.env}/move_sizes_v1"

  def index
    @move_sizes = Rails.cache.fetch(CACHE_KEY, expires_in: 1.minute) do
      Rails.logger.info "[CACHE] MISS: loading fresh move sizes"
      # MoveSize.order(:position).to_a
      MoveSize.includes(default_rooms: :room, suggested_rooms: :room)
              .order(:position)
              .to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached move sizes"
    render json: @move_sizes, status: :ok
  end

  def create
    @move_size = MoveSize.new(move_size_params)
    authorize @move_size

    if @move_size.save
      render json: @move_size, status: :created
    else
      render json: @move_size.errors, status: :unprocessable_content
    end
  end

  def update
    authorize @move_size

    if ActiveModel::Type::Boolean.new.cast(move_size_params[:remove_image])
      @move_size.image.purge_later
    end

    if @move_size.update(move_size_params)
      render json: @move_size
    else
      render json: @move_size.errors, status: :unprocessable_content
    end
  end

  def destroy
    authorize @move_size
    @move_size.destroy!
    head :no_content
  rescue ActiveRecord::RecordNotDestroyed
    render json: @move_size.errors, status: :unprocessable_content
  end

  private

  def set_move_size
    @move_size = MoveSize.find(params.expect(:id))
  end

  def move_size_params
    permitted = params.expect(
      move_size: [
        :name,
        :description,
        :position,
        :dispersion,
        :truck_count,
        :image,
        :remove_image,
        crew_size_settings: []
      ]
    )

    permitted[:crew_size_settings] = parse_json(params[:move_size][:crew_size_settings], [])

    permitted
  end

  def parse_json(value, default)
    return default if value.nil?
    return value unless value.is_a?(String)

    JSON.parse(value)
  rescue JSON::ParserError
    default
  end
end

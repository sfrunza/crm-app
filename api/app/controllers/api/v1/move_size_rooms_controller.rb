class Api::V1::MoveSizeRoomsController < ApplicationController
  # include Pundit::Authorization
  before_action :set_move_size

  def create
    relation = @move_size.move_size_rooms.new(move_size_room_params)
    # authorize relation

    if relation.save
      render json: relation, status: :created
    else
      render json: relation.errors, status: :unprocessable_content
    end
  end

  def update
    relation = @move_size.move_size_rooms.find(params.expect(:id))
    # authorize relation

    if relation.update(move_size_room_params)
      render json: relation
    else
      render json: relation.errors, status: :unprocessable_content
    end
  end

  def destroy
    relation = @move_size.move_size_rooms.find(params.expect(:id))
    # authorize relation
    relation.destroy!
    head :no_content
  end

  private

  def set_move_size
    @move_size = MoveSize.find(params.expect(:move_size_id))
  end

  def move_size_room_params
    raw = params.require(:move_size_room)
                .permit(:room_id, :kind, :position, items: {})

    raw.to_h.symbolize_keys.tap do |h|
      h[:items] = (h[:items] || {}).to_h.transform_values(&:to_i)
    end
  end

end

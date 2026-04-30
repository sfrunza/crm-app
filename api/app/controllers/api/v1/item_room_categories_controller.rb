class Api::V1::ItemRoomCategoriesController < ApplicationController
  # include Pundit::Authorization
  def index
    render json: ItemRoomCategory.order(:id), status: :ok
  end

  def create
    relation = ItemRoomCategory.new(relation_params)
    # authorize relation

    if relation.save
      render json: relation, status: :created
    else
      render json: relation.errors, status: :unprocessable_content
    end
  end

  def destroy
    relation = ItemRoomCategory.find(params.expect(:id))
    # authorize relation
    relation.destroy!
    head :no_content
  end

  private

  def relation_params
    params.expect(item_room_category: [ :item_id, :room_id ])
  end
end

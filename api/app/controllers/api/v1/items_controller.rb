class Api::V1::ItemsController < ApplicationController
  include Pundit::Authorization
  before_action :set_item, only: %i[update destroy]

  def index
    render json: Item.includes(image_attachment: :blob).order(:position), status: :ok
  end

  def create
    item = Item.new(item_params.except(:remove_image))
    authorize item

    if item.save
      render json: item, status: :created
    else
      render json: item.errors, status: :unprocessable_content
    end
  end

  def update
    authorize @item

    if ActiveModel::Type::Boolean.new.cast(item_params[:remove_image])
      @item.image.purge_later
    end

    if @item.update(item_params.except(:remove_image))
      render json: @item
    else
      render json: @item.errors, status: :unprocessable_content
    end
  end

  def destroy
    authorize @item
    @item.destroy!
    head :no_content
  end

  private

  def set_item
    @item = Item.find(params.expect(:id))
  end

  def item_params
    params.expect(item: [
      :name,
      :description,
      :volume,
      :weight,
      :is_box,
      :is_furniture,
      :is_special_handling,
      :position,
      :active,
      :image,
      :remove_image
    ])
  end
end

class Api::V1::FoldersController < ApplicationController
  include Pundit::Authorization
  before_action :set_folder, only: %i[ update destroy ]

  CACHE_KEY = "#{Rails.env}/folders_v1"

  # GET /folders
  def index
    @folders = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh folders"
      Folder.order(:position).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached folders"
    render json: @folders, status: :ok
  end

  # POST /folders
  def create
    @folder = Folder.new(folder_params)
    authorize @folder

    if @folder.save
      render json: @folder, status: :created
    else
      render json: @folder.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /folders/1
  def update
    authorize @folder

    if @folder.update(folder_params)
      render json: @folder
    else
      render json: @folder.errors, status: :unprocessable_entity
    end
  end

  # DELETE /folders/1
  def destroy
    authorize @folder
    @folder.destroy!

    head :no_content
  rescue ActiveRecord::RecordNotDestroyed
    render json: @folder.errors, status: :unprocessable_content
  end

  private

  def set_folder
    @folder = Folder.find(params.expect(:id))
  end

  def folder_params
    params.expect(folder: [ :name, :position, :is_default ])
  end
end

class Api::V1::RequestMessagesController < ApplicationController
  include Pundit::Authorization
  before_action :set_request
  before_action :set_message, only: %i[show update destroy mark_as_viewed]

  # GET /api/v1/requests/:request_id/messages
  def index
    authorize @request, :show?

    @messages = @request.messages
                        .includes(:user)
                        .order(created_at: :asc)

    render json: @messages, each_serializer: MessageSerializer, status: :ok
  end

  # GET /api/v1/requests/:request_id/messages/:id
  def show
    authorize @request, :show?

    render json: @message, serializer: MessageSerializer, status: :ok
  end

  # POST /api/v1/requests/:request_id/messages
  def create
    authorize @request, :show?

    @message = @request.messages.build(message_params)
    @message.user = Current.user

    if @message.save
      render json: @message, serializer: MessageSerializer, status: :created
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/requests/:request_id/messages/:id
  def update
    authorize @request, :update?

    # Only allow updating your own messages
    unless @message.user_id == Current.user.id || Current.user.admin? || Current.user.manager?
      render json: { error: "You can only edit your own messages" }, status: :forbidden
      return
    end

    if @message.update(message_params)
      render json: @message, serializer: MessageSerializer, status: :ok
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/requests/:request_id/messages/:id
  def destroy
    authorize @request, :update?

    # Only allow deleting your own messages
    unless @message.user_id == Current.user.id || Current.user.admin? || Current.user.manager?
      render json: { error: "You can only delete your own messages" }, status: :forbidden
      return
    end

    @message.destroy!
    head :no_content
  rescue ActiveRecord::RecordNotDestroyed
    render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
  end

  # POST /api/v1/requests/:request_id/messages/:id/mark_as_viewed
  def mark_as_viewed
    authorize @request, :show?

    @message.mark_as_viewed_by(Current.user)

    render json: @message, serializer: MessageSerializer, status: :ok
  end

  # POST /api/v1/requests/:request_id/messages/mark_all_as_viewed
  def mark_all_as_viewed
    authorize @request, :show?

    user_id = Current.user.id
    unread = @request.messages
                     .where.not(user_id: user_id)
                     .where.not("viewed_by @> ?", [ user_id ].to_json)

    unread.find_each do |message|
      message.mark_as_viewed_by(Current.user)
    end

    head :ok
  end

  # GET /api/v1/requests/:request_id/messages/unread_count
  def unread_count
    authorize @request, :show?

    user_id = Current.user.id
    count = @request.messages
                    .where.not(user_id: user_id)
                    .where.not("viewed_by @> ?", [ user_id ].to_json)
                    .count

    render json: { unread_count: count }, status: :ok
  end

  private

  def set_request
    @request = Request.find(params[:request_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Request not found" }, status: :not_found
  end

  def set_message
    @message = @request.messages.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Message not found" }, status: :not_found
  end

  def message_params
    params.expect(message: [ :content ])
  end
end

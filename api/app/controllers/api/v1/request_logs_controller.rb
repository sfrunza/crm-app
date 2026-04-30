class Api::V1::RequestLogsController < ApplicationController
  include Pundit::Authorization
  before_action :set_request

  # GET /api/v1/requests/:request_id/request_logs
  def index
    authorize @request, :show?

    per_page = (params[:per_page] || 25).to_i
    pagy, logs = pagy(
      @request.request_logs.includes(:user).recent,
      limit: per_page
    )

    render json: {
      logs: ActiveModelSerializers::SerializableResource.new(
        logs,
        each_serializer: RequestLogSerializer
      ),
      pagination: {
        total_pages: pagy.pages,
        current_page: pagy.page,
        total_count: pagy.count
      }
    }, status: :ok
  end

  private

  def set_request
    @request = Request.find(params[:request_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Request not found" }, status: :not_found
  end
end

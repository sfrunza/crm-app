class Api::V1::CalendarRatesController < ApplicationController
  include Pundit::Authorization
  allow_unauthenticated_access only: %i[ index ]
  before_action :set_calendar_rate, only: %i[ update destroy ]

  CACHE_KEY = "#{Rails.env}/calendar_rates_v1"

  # GET /calendar_rates
  def index
    @calendar_rates_json = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: building calendar rates JSON"

      records = CalendarRate
        .where(date: Date.today.beginning_of_month..11.months.from_now.end_of_month)
        .order(:date)
        .pluck(:id, :date, :rate_id, :enable_automation, :enable_auto_booking, :is_blocked)

      CalendarRatesSerializer.new(records).as_json
    end

    Rails.logger.info "[CACHE] HIT: returning cached calendar rates"
    render json: @calendar_rates_json, status: :ok
  end


  # POST /calendar_rates
  def create
    @calendar_rate = CalendarRate.new(calendar_rate_params)
    authorize @calendar_rate

    if @calendar_rate.save
      render json: @calendar_rate, status: :created
    else
      render json: @calendar_rate.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /calendar_rates/1
  def update
    authorize @calendar_rate

    if @calendar_rate.update(calendar_rate_params)
      render json: @calendar_rate
    else
      render json: @calendar_rate.errors, status: :unprocessable_entity
    end
  end

  # DELETE /calendar_rates/1
  def destroy
    authorize @calendar_rate
    @calendar_rate.destroy!

    head :no_content
  end

  private

  def set_calendar_rate
    @calendar_rate = CalendarRate.find(params.expect(:id))
  end

  def calendar_rate_params
    params.expect(
      calendar_rate: [ :date, :enable_automation, :enable_auto_booking, :is_blocked, :rate_id ]
    )
  end
end

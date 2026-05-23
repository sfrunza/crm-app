class Api::V1::LookupCitiesController < ApplicationController
  allow_unauthenticated_access only: %i[create]

  # POST /api/v1/lookup-city
  def create
    zip = params[:zip].to_s.strip

    unless zip.match?(/\A\d{5}\z/)
      return render json: { data: nil, error: "Invalid ZIP code" }
    end

    result = GoogleGeocodingService.lookup_zip(zip)

    if result[:success]
      render json: { data: result[:data], error: nil }
    else
      render json: { data: nil, error: result[:error] }
    end
  end
end

class GoogleRoutesService
  BASE_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"

  def self.route(origin:, destination:, stops: [], travel_mode: "DRIVE")
    new(origin, destination, stops, travel_mode).call
  end

  def initialize(origin, destination, stops, travel_mode)
    @origin = origin
    @destination = destination
    @stops = stops
    @travel_mode = travel_mode
  end

  def call
    api_key = Rails.application.credentials.google_maps_api_key

    response = connection.post do |req|
      req.headers["X-Goog-Api-Key"] = api_key
      req.headers["X-Goog-FieldMask"] = field_mask
      req.headers["Content-Type"] = "application/json"

      req.body = payload.to_json
    end

    result = JSON.parse(response.body)

    # Log API errors for debugging
    if result["error"]
      Rails.logger.error "[GoogleRoutesService] API Error: #{result['error']}"
    end

    result
  end

  private

  def connection
    Faraday.new(url: BASE_URL)
  end

  # ====================================================================
  # Helpers
  # ====================================================================

  def payload
    {
      origin: lat_lng(@origin),
      destination: lat_lng(@destination),
      intermediates: @stops.map { |s| lat_lng(s) },
      travelMode: @travel_mode,
      routingPreference: "TRAFFIC_UNAWARE"
    }
  end

  def lat_lng(point)
    {
      location: {
        latLng: {
          latitude: point[:lat],
          longitude: point[:lng]
        }
      }
    }
  end

  def field_mask
    [
      "routes.distanceMeters",
      "routes.duration",
      "routes.legs.distanceMeters",
      "routes.legs.duration"
    ].join(",")
  end
end

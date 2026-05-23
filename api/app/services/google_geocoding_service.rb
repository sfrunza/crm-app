class GoogleGeocodingService
  BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

  def self.lookup_zip(zip)
    new(zip).call
  end

  def initialize(zip)
    @zip = zip
  end

  def call
    api_key = ENV["GOOGLE_MAPS_API_KEY"]
    return failure("Geocoding unavailable") if api_key.blank?

    response = connection.get do |req|
      req.params = {
        components: "country:US|postal_code:#{@zip}",
        key: api_key,
        language: "en",
        address: "#{@zip}, USA"
      }
    end

    result = JSON.parse(response.body)

    Rails.logger.info "[GoogleGeocodingService] API Response: #{result.inspect}"

    if result["status"] != "OK" || result["results"].blank?
      Rails.logger.error "[GoogleGeocodingService] API Error: #{result['status']} - #{result['error_message']}"
      return failure(error_message_for(result["status"]))
    end

    parse_result(result["results"].first)
  end

  private

  def connection
    Faraday.new(url: BASE_URL)
  end

  def parse_result(result)
    components = result["address_components"]
    city = extract_component(components, "locality") ||
           extract_component(components, "sublocality_level_1") ||
           extract_component(components, "administrative_area_level_2")
    state = extract_short_component(components, "administrative_area_level_1")
    zip = extract_component(components, "postal_code")
    country = extract_short_component(components, "country")
    location = result["geometry"]["location"]

    return failure("Non-US ZIP code") if country.present? && country != "US"
    return failure("Could not resolve city for this ZIP code") if city.blank? || state.blank?

    success(city: city, state: state, zip: zip.presence || @zip, location: location)
  end

  def extract_component(components, type)
    component = components.find { |c| c["types"].include?(type) }
    component&.dig("long_name")
  end

  def extract_short_component(components, type)
    component = components.find { |c| c["types"].include?(type) }
    component&.dig("short_name")
  end

  def success(data)
    { success: true, data: data }
  end

  def failure(message)
    { success: false, error: message }
  end

  def error_message_for(status)
    case status
    when "ZERO_RESULTS", "INVALID_REQUEST"
      "Invalid ZIP code"
    else
      "Lookup failed"
    end
  end
end

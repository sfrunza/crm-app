class RouteCalculator
  METERS_TO_MILES = 0.000621371

  ROUTE_RULES = {
    "local_move" => ->(_r) { rule(origin: true, destination: true) },
    "flat_rate" => ->(_r) { rule(origin: true, destination: true) },

    "inside_move" => ->(_r) { rule(origin: true) },
    "loading_help" => ->(_r) { rule(origin: true) },
    "packing_only" => ->(_r) { rule(origin: true) },
    "unloading_help" => ->(_r) { rule(destination: true) },

    "overnight_truck_storage" => ->(r) {
      r.is_moving_from_storage? ?
        rule(origin: false, destination: true) :
        rule(origin: true, destination: false)
    },
    "moving_with_storage" => ->(r) {
      r.is_moving_from_storage? ?
        rule(origin: false, destination: true) :
        rule(origin: true, destination: false)
    }
  }.freeze

  DEFAULT_RULE = ->(_r) { rule(origin: true, destination: true) }

  def self.call(request, save: true)
    new(request, save: save).call
  end

  def initialize(request, save: true)
    @request = request
    @save = save
  end

  def call
    return failure("No parking location configured") unless parking_coords

    @directions = {}
    @travel_time = 0

    rule = route_rule

    origin = rule[:origin] ? origin_coords : nil
    destination = rule[:destination] ? destination_coords : nil

    return failure("Missing origin coordinates") if rule[:origin] && origin.nil?
    return failure("Missing destination coordinates") if rule[:destination] && destination.nil?

    build_routes(rule, origin, destination)

    calculate_grand_total!

    # Apply to request object
    @request.directions = @directions
    @request.travel_time = @travel_time

    if @save
      @request.update_columns(
        directions: @directions,
        travel_time: @travel_time,
        updated_at: Time.current
      )
    end

    success
  end

  private

  # ====================================================================
  # Rules
  # ====================================================================

  def self.rule(origin: false, destination: false, allow_stops: true)
    { origin:, destination:, allow_stops: }
  end

  def route_rule
    code = @request.service&.code
    (ROUTE_RULES[code] || DEFAULT_RULE).call(@request)
  end

  # ====================================================================
  # Route building
  # ====================================================================

  def build_routes(rule, origin, destination)
    nodes = build_nodes(rule, origin, destination)
    return if nodes.size < 2

    route = GoogleRoutesService.route(
      origin: nodes.first[:coords],
      destination: nodes.last[:coords],
      stops: nodes[1..-2].map { |n| n[:coords] }
    )

    save_route_segments(route, nodes)
  rescue => e
    Rails.logger.error "[RouteCalculator] route build failed: #{e.message}"
  end

  # ====================================================================
  # Persistence
  # ====================================================================

  def build_nodes(rule, origin, destination)
    nodes = []

    nodes << { key: :parking_start, coords: parking_coords, zip: parking_zip }

    if rule[:origin]
      nodes << { key: :origin, coords: origin, zip: zip(@request.origin) }
    end

    if rule[:allow_stops]
      @request.stops.each do |stop|
        stop_coords = coords(stop)
        next unless stop_coords

        nodes << { key: :stop, coords: stop_coords, zip: zip(stop) }
      end
    end

    if rule[:destination]
      nodes << { key: :destination, coords: destination, zip: zip(@request.destination) }
    end

    nodes << { key: :parking_end, coords: parking_coords, zip: parking_zip }

    nodes
  end

  def save_route_segments(response, nodes)
    route = response.dig("routes", 0) or return
    legs = route["legs"] || []

    expected_legs = nodes.size - 1
    if legs.size != expected_legs
      Rails.logger.warn "[RouteCalculator] Expected #{expected_legs} legs, got #{legs.size}"
      return
    end

    first_leg = legs.first
    case nodes[1]&.dig(:key)
    when :origin
      save_leg("PO", first_leg, nodes[0][:zip], nodes[1][:zip])
    when :destination
      save_leg("PD", first_leg, nodes[0][:zip], nodes[1][:zip])
    end

    last_leg = legs.last
    case nodes[-2]&.dig(:key)
    when :origin
      save_leg("OP", last_leg, nodes[-2][:zip], nodes[-1][:zip])
    when :destination
      save_leg("DP", last_leg, nodes[-2][:zip], nodes[-1][:zip])
    end

    origin_idx = nodes.index { |n| n[:key] == :origin }
    dest_idx = nodes.index { |n| n[:key] == :destination }

    if origin_idx && dest_idx && dest_idx > origin_idx
      od_legs = legs[origin_idx...dest_idx]
      od_zips = nodes[origin_idx..dest_idx].map { |n| n[:zip] }
      save_od_legs(od_legs, od_zips)
    end
  end

  def save_leg(key, leg, from_zip, to_zip)
    distance = miles(leg["distanceMeters"])
    time = minutes(leg["duration"])

    @directions[key] = {
      total_distance: distance,
      total_time: time,
      address: [
        {
          from: from_zip,
          to: to_zip,
          distance: distance,
          time: time
        }
      ]
    }
  end

  def save_od_legs(legs, zips)
    total_distance = legs.sum { |leg| miles(leg["distanceMeters"]) }
    total_time = legs.sum { |leg| minutes(leg["duration"]) }

    addresses = legs.map.with_index do |leg, i|
      {
        from: zips[i],
        to: zips[i + 1],
        distance: miles(leg["distanceMeters"]),
        time: minutes(leg["duration"])
      }
    end

    @directions["OD"] = {
      total_distance: total_distance,
      total_time: total_time,
      address: addresses
    }
  end

  # ====================================================================
  # Totals
  # ====================================================================

  def calculate_grand_total!
    total_distance = 0
    total_time = 0
    travel_time = 0

    @directions.each do |key, data|
      total_distance += data[:total_distance]
      total_time += data[:total_time]

      travel_time += data[:total_time] if %w[PO OP PD DP].include?(key)
    end

    @directions["grand_total"] = {
      total_distance: total_distance.round(2),
      total_time: total_time.round(2)
    }

    @travel_time = ((travel_time / 15.0).ceil * 15).to_i
  end

  # ====================================================================
  # Helpers
  # ====================================================================

  def parking_coords
    Setting.parking_location
  end

  def parking_zip
    zip_from_string(Setting.parking_address)
  end

  def origin_coords
    coords(@request.origin)
  end

  def destination_coords
    coords(@request.destination)
  end

  def stops_coords
    @request.stops.map { |s| coords(s) }.compact
  end

  def coords(address)
    loc = address&.dig("location") || address&.dig(:location)
    return unless loc

    lat, lng = loc.values_at("lat", "lng")
    return if lat.to_f.zero? || lng.to_f.zero?

    { lat: lat.to_f, lng: lng.to_f }
  end

  def zip(address)
    address.is_a?(Hash) ? address["zip"] || address[:zip] : ""
  end

  def zip_from_string(str)
    str.to_s[/\b\d{5}(-\d{4})?\b/] || ""
  end

  def miles(meters)
    (meters.to_f * METERS_TO_MILES).round(2)
  end

  def minutes(duration)
    duration.to_s.delete("s").to_i / 60.0
  end

  def success
    { success: true, request: @request }
  end

  def failure(message)
    { success: false, error: message }
  end
end

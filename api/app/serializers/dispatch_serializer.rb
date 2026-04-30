class DispatchSerializer < ActiveModel::Serializer
  attributes :date, :trucks

  # private

  def target_date
    value = object.date
    return value if value.is_a?(Date)
    Date.parse(value.to_s)
  end

  def trucks
    object.trucks.map { |truck| serialize_truck(truck) }
  end

  def serialize_truck(truck)
    requests_for_date = truck.requests.select do |r|
      r.moving_date.present? && r.moving_date.to_date == target_date
    end

    {
      id: truck.id,
      name: truck.name,
      requests: requests_for_date.map { |r| serialize_request(r) }
    }
  end

  def serialize_request(request)
    # {
    #   id: request.id,
    #   moving_date: request.moving_date,
    #   start_time_window: request.start_time_window,
    #   total_time: request.total_time
    # }
    RequestSerializer.new(request).as_json
  end
end

# class DispatchSerializer < ActiveModel::Serializer
#   attributes :date

#   has_many :trucks

#   def trucks
#     object.trucks
#   end
# end

class CustomerRequestSerializer < ActiveModel::Serializer
  attributes :id,
             :moving_date,
             :start_time_window,
             :end_time_window,
             :service_id,
             :status,
             :move_size_id,
             :crew_size,
             :origin,
             :destination
end

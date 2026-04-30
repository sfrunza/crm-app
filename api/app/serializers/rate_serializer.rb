class RateSerializer < ActiveModel::Serializer
  attributes :id, :name, :active, :color, :movers_rates, :extra_mover_rate, :is_default, :extra_truck_rate
end

class TruckSerializer < ActiveModel::Serializer
  attributes :id, :name, :active, :position
end

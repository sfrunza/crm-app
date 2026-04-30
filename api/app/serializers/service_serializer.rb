class ServiceSerializer < ActiveModel::Serializer
  attributes :id, :name, :active, :miles_setting, :position, :is_default, :code
end

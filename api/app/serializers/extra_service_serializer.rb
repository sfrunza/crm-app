class ExtraServiceSerializer < ActiveModel::Serializer
  attributes :id, :name, :price, :active, :position
end

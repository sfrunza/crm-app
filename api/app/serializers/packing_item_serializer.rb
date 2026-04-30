class PackingItemSerializer < ActiveModel::Serializer
  attributes :id, :name, :price, :position
end

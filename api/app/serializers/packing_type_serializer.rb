class PackingTypeSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :is_default, :labor_increase, :position

  def description
    object.description&.body&.to_html
  end
end

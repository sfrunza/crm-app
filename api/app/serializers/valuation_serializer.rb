class ValuationSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :is_default, :active

  def description
    object.description&.body&.to_html
  end
end

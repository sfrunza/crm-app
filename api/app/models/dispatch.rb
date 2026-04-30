class Dispatch
  include ActiveModel::Model

  attr_accessor :date, :trucks

  # ActiveModel::Serializer expects this method to exist on the serialized object.
  def read_attribute_for_serialization(attr)
    public_send(attr)
  end
end

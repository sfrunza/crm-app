class ParklotSlotSerializer < ActiveModel::Serializer
  attributes :id, :slot_type, :is_moving_day, :start_minutes, :end_minutes, :date, :truck_id

  attribute :request do
    ActiveModelSerializers::SerializableResource.new(
      object.request,
      serializer: RequestSerializer
    ).as_json
  end

  def date
    object.date&.iso8601
  end
end

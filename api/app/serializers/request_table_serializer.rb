class RequestTableSerializer < ActiveModel::Serializer
  attributes  :id,
              :moving_date,
              :service,
              :move_size,
              :status,
              :created_at,
              :updated_at,
              :booked_at,
              :grand_total,
              :crew_size,
              :is_moving_from_storage,
              :has_paired_request,
              :origin,
              :destination,
              :customer

  def customer
    if object.customer.present?
    {
      first_name: object.customer.first_name,
      last_name: object.customer.last_name,
      phone: object.customer.phone
      }
    else
      nil
    end
  end

  def origin
    {
      city: object.origin["city"],
      state: object.origin["state"],
      zip: object.origin["zip"]
    }
  end

  def destination
    {
      city: object.destination["city"],
      state: object.destination["state"],
      zip: object.destination["zip"]
    }
  end

  def service
    { name: object.service.name }
  end

  def move_size
    { name: object.move_size.present? ? object.move_size.name : nil }
  end

  def has_paired_request
    object.paired_request.present?
  end
end

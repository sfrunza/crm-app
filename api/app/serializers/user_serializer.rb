class UserSerializer < ActiveModel::Serializer
  attributes :id,
             :email_address,
             :first_name,
             :last_name,
             :role,
             :phone,
             :additional_email,
             :additional_phone,
             :requests_count

  def email_address
    object.email_address
  end

  def requests_count
    object.requests_as_customer.size
  end
end

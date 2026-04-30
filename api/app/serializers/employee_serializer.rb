class EmployeeSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email_address, :phone, :role, :active, :created_at
end

# RailsSettings Model
class Setting < RailsSettings::Base
  cache_prefix { "v1" }

  field :company_name, type: :string, default: "Your Company Name"
  field :company_address, type: :string, default: "Your Company Address"
  field :company_phone, type: :string, default: "Your Company Phone"
  field :company_email, type: :string, default: "Your Company Email"
  field :company_website, type: :string, default: "Your Company Website"
  field :parking_address, type: :string, default: "123 Main St, Anytown, CA 12345"
  field :parking_location, type: :nested_location, default: { lat: 0, lng: 0 }
end

require 'faker'

puts "Deleting old records..."

# Request children/join tables must be cleared before requests when using delete_all.
InvoiceItem.delete_all
Invoice.delete_all
Payment.delete_all
Message.delete_all
ParklotSlot.delete_all
RequestTruck.delete_all
RequestMover.delete_all
RequestLog.delete_all
Request.delete_all
Session.delete_all
PaymentMethod.delete_all
User.delete_all
CalendarRate.delete_all
Rate.delete_all
Service.delete_all
PackingType.delete_all
Valuation.delete_all
Truck.delete_all
MoveSize.delete_all
EmailTemplate.delete_all
Folder.delete_all
Room.delete_all
Item.delete_all

puts "Creating new records..."


##
### Create user.wheres
##
User.create!(
  email_address: "admin@admin.com",
  password: "111111",
  role: "admin",
  first_name: "Admin",
  last_name: "Main",
)

User.create!(
  email_address: "frunza.sergiu3@gmail.com",
  password: "111111",
  first_name: "Sergiu",
  last_name: "Frunza",
)

User.create!(
  email_address: "test1@example.com",
  password: "111111",
  first_name: "Test1",
  last_name: "User.where1",
)

User.create!(
  email_address: "test2@example.com",
  password: "111111",
  first_name: "Test2",
  last_name: "User.where2",
)

User.create!(
  email_address: "test3@example.com",
  password: "111111",
  first_name: "Test3",
  last_name: "User.where3",
)

User.create!(
  email_address: "test4@example.com",
  password: "111111",
  first_name: "Test4",
  last_name: "User.where4",
)

### Create rates
Rate.create(
  name: "Discount",
  color: "#00a455",
  is_default: true,
  extra_mover_rate: 4000,
  extra_truck_rate: 5000,
  movers_rates: {
    "2" => { "hourly_rate" => 11900 },
    "3" => { "hourly_rate" => 15900 },
    "4" => { "hourly_rate" => 19900 }
  })
Rate.create(name: "Regular", color: "#0044ff",
  extra_mover_rate: 4000,
  extra_truck_rate: 5000,
  movers_rates: {
    "2" => { "hourly_rate" => 13900 },
    "3" => { "hourly_rate" => 17900 },
    "4" => { "hourly_rate" => 21900 }
  })
Rate.create(name: "Subpeak", color: "#ffa500",
  extra_mover_rate: 5000,
  extra_truck_rate: 5000,
  movers_rates: {
    "2" => { "hourly_rate" => 15900 },
    "3" => { "hourly_rate" => 19900 },
    "4" => { "hourly_rate" => 24900 }
  })
Rate.create(name: "Peak", color: "#ff5400",
  extra_mover_rate: 5000,
  extra_truck_rate: 5000,
  movers_rates: {
    "2" => { "hourly_rate" => 17900 },
    "3" => { "hourly_rate" => 22900 },
    "4" => { "hourly_rate" => 27900 }
  })
Rate.create(name: "High Peak", color: "#fb0009",
  extra_mover_rate: 10000,
  extra_truck_rate: 10000,
  movers_rates: {
    "2" => { "hourly_rate" => 29900 },
    "3" => { "hourly_rate" => 39900 },
    "4" => { "hourly_rate" => 49900 }
  })

### Create services
Service.create(name: "Local Move", code: "local_move", is_default: true)
Service.create(name: "Packing Only", code: "packing_only", is_default: true)
Service.create(name: "Loading Help", code: "loading_help", is_default: true)
Service.create(name: "Unloading Help", code: "unloading_help", is_default: true)
Service.create(name: "Moving with Storage", code: "moving_with_storage", is_default: true)
Service.create(name: "Overnight Truck Storage", code: "overnight_truck_storage", is_default: true)
Service.create(name: "Flat Rate", code: "flat_rate", is_default: true)

### Create packing types
PackingType.create(name: "I will pack by myself ", labor_increase: 0, is_default: true)

### Create valuations
Valuation.create(name: "Released Value Protection (included)", is_default: true, active: true)

### Create trucks
Truck.create(name: "26 Foot Truck")
Truck.create(name: "20 Foot Truck")
Truck.create(name: "18 Foot Truck")

### Create move sizes
MoveSize.create(name: "Room or less (300 sq ft)", description: "Room or less (300 sq ft)", truck_count: 1)
MoveSize.create(name: "Studio apartment", description: "Studio apartment", truck_count: 1)
MoveSize.create(name: "Small 1 Bedroom  apartment", description: "Small 1 Bedroom  apartment", truck_count: 1)
MoveSize.create(name: "Large 1 Bedroom  apartment", description: "Large 1 Bedroom  apartment", truck_count: 1)
MoveSize.create(name: "Small 2 Bedroom  apartment", description: "Small 2 Bedroom  apartment", truck_count: 1)
MoveSize.create(name: "Large 2 Bedroom  apartment", description: "Large 2 Bedroom  apartment", truck_count: 1)
MoveSize.create(name: "3 Bedroom apartment", description: "3 Bedroom  apartment", truck_count: 1)
MoveSize.create(name: "2 Bedroom house", description: "2 Bedroom house", truck_count: 1)
MoveSize.create(name: "3 Bedroom house", description: "3 Bedroom house", truck_count: 1)
MoveSize.create(name: "4 Bedroom house", description: "4 Bedroom house", truck_count: 1)
MoveSize.create(name: "Commercial move", description: "Commercial move", truck_count: 1)

Room.create(name: "Living Room")
Room.create(name: "Kitchen")

Item.create(name: "Bed", volume: 100, weight: 100)
Item.create(name: "Chair", volume: 100, weight: 100)
Item.create(name: "Table", volume: 100, weight: 100)
Item.create(name: "Sofa", volume: 100, weight: 100)
Item.create(name: "Dishwasher", volume: 100, weight: 100)
Item.create(name: "Refrigerator", volume: 100, weight: 100)
Item.create(name: "TV", volume: 100, weight: 100, is_special_handling: true)
Item.create(name: "Computer", volume: 100, weight: 100, is_special_handling: true)

### Create folders
Folder.create(name: "Default", is_default: true)

### Create requests
STATUSES = Request.statuses.keys
REQUESTS_TO_CREATE = 100

customer_ids = User.where(role: "customer").pluck(:id)
service_ids  = Service.pluck(:id)
move_size_ids = MoveSize.pluck(:id)

now = Time.current

records = REQUESTS_TO_CREATE.times.map do
  moving_date = Faker::Date.between(from: 1.year.ago, to: 1.year.from_now)

  delivery_start = Faker::Time.between(from: moving_date - 3.days, to: moving_date + 3.days)
  delivery_end   = delivery_start + rand(2..6).hours

  schedule_start = Faker::Time.between(from: moving_date - 5.days, to: moving_date)
  schedule_end   = schedule_start + rand(2..6).hours

  {
    customer_id: customer_ids.sample,
    service_id: service_ids.sample,
    packing_type_id: PackingType.first.id,
    valuation: {
      total: 0,
      description: "",
      title: "",
      valuation_id: nil
    },
    move_size_id: move_size_ids.sample,

    status: STATUSES.sample,
    moving_date: moving_date,

    delivery_date_window_start: delivery_start,
    delivery_date_window_end: delivery_end,
    schedule_date_window_start: schedule_start,
    schedule_date_window_end: schedule_end,


    rate: 10000,
    deposit: 10000,

    crew_size: rand(1..4),

    origin: {
      street: Faker::Address.street_address,
      city: Faker::Address.city,
      state: Faker::Address.state_abbr,
      apt: Faker::Address.building_number
    },

    destination: {
      street: Faker::Address.street_address,
      city: Faker::Address.city,
      state: Faker::Address.state_abbr,
      apt: Faker::Address.building_number
    },

    created_at: now,
    updated_at: now
  }
end

Request.insert_all!(records)

puts "Seeding complete!"

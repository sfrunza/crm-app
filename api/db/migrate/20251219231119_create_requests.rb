class CreateRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :requests do |t|
      t.references :customer, foreign_key: { to_table: :users }
      t.references :foreman, foreign_key: { to_table: :users }
      t.references :delivery_foreman, null: true, foreign_key: { to_table: :users }
      t.references :service, null: false, foreign_key: true
      t.references :packing_type, null: false, foreign_key: true
      t.references :move_size, foreign_key: true
      t.references :paired_request, foreign_key: { to_table: :requests }

      # snapshot of template at booking
      t.jsonb :move_size_snapshot, null: true

      # user-selected suggested rooms
      t.jsonb :selected_suggested_room_ids, default: []

      # frozen totals (for fast reporting)
      t.integer :total_items, default: 0
      t.integer :total_boxes, default: 0
      t.decimal :total_volume, precision: 10, scale: 2, default: 0
      t.decimal :total_weight, precision: 10, scale: 2, default: 0

      t.date :moving_date
      t.date :delivery_date_window_start
      t.date :delivery_date_window_end
      t.date :schedule_date_window_start
      t.date :schedule_date_window_end

      t.integer :status, default: 0, null: false

      t.jsonb :extra_services, default: [], null: false
      t.jsonb :packing_items, default: [], null: false
      t.jsonb :details, null: false, default: {
        delicate_items_question_answer: "",
        bulky_items_question_answer: "",
        disassemble_items_question_answer: "",
        comments: "",
        is_touched: false
      }

      t.integer :start_time_window
      t.integer :end_time_window
      t.integer :start_time_window_delivery
      t.integer :end_time_window_delivery
      t.integer :start_time_window_schedule
      t.integer :end_time_window_schedule

      t.boolean :is_same_day_delivery, default: false
      t.boolean :is_delivery_now, default: false
      t.boolean :is_calculator_enabled, default: true
      t.boolean :is_moving_from_storage, default: false
      t.boolean :is_deposit_accepted, default: false

      t.integer :rate, default: 0
      t.integer :travel_time, default: 0
      t.integer :deposit, default: 10_000
      t.integer :min_total_time, default: 120, null: false
      t.integer :extra_services_total, default: 0
      t.integer :packing_items_total, default: 0

      t.jsonb :work_time, default: { min: 0, max: 0 }
      t.jsonb :total_time, default: { min: 0, max: 0 }
      t.jsonb :transportation, default: { min: 0, max: 0 }
      t.jsonb :labor_price, default: { min: 0, max: 0 }, null: false
      t.jsonb :grand_total, default: { min: 0, max: 0 }, null: false
      t.jsonb :balance, default: { min: 0, max: 0 }, null: false
      t.jsonb :directions, default: {}, null: false
      t.jsonb :fuel, default: {
        percent: 0,
        value: 0,
        total: 0
      }, null: false
      t.jsonb :discount, default: {
        percent: 0,
        value: 0,
        total: 0
      }, null: false
      t.jsonb :valuation, default: {
        total: 0,
        description: "",
        name: "",
        valuation_id: nil
      }, null: false

      t.integer :crew_size
      t.integer :crew_size_delivery

      t.boolean :can_edit_request, default: true, null: false

      t.text :sales_notes
      t.text :driver_notes
      t.text :customer_notes
      t.text :dispatch_notes

      t.jsonb :stops, default: [], null: false

      t.jsonb :origin, null: false, default: {
        street: "",
        city: "",
        state: "",
        zip: "",
        apt: "",
        floor_id: nil,
        location: {
          lat: 0,
          lng: 0
        }
      }

      t.jsonb :destination, null: false, default: {
        street: "",
        city: "",
        state: "",
        zip: "",
        apt: "",
        floor_id: nil,
        location: {
          lat: 0,
          lng: 0
        }
      }

      t.datetime :signed_at
      t.datetime :booked_at
      t.timestamps
    end

    # Standard indexes
    add_index :requests, :status
    add_index :requests, :moving_date
    add_index :requests, [ :status, :moving_date ]

    # Date range queries
    add_index :requests, :delivery_date_window_start
    add_index :requests, :delivery_date_window_end
    add_index :requests, :schedule_date_window_start
    add_index :requests, :schedule_date_window_end

    # Boolean flags
    add_index :requests, :is_moving_from_storage
    add_index :requests, :can_edit_request
    add_index :requests, :is_same_day_delivery
    add_index :requests, :is_deposit_accepted
    add_index :requests, :is_calculator_enabled

    # Timestamps for ordering/filtering
    add_index :requests, :created_at
    add_index :requests, :updated_at
    add_index :requests, :signed_at
    add_index :requests, :booked_at

    # Composite indexes for common query patterns
    add_index :requests, [ :customer_id, :status ]
    add_index :requests, [ :foreman_id, :status ]
    add_index :requests, [ :status, :created_at ]  # For dashboard listings
    add_index :requests, [ :moving_date, :status ]  # For calendar views
  end
end

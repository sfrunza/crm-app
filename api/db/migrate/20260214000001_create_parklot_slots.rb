class CreateParklotSlots < ActiveRecord::Migration[8.0]
  def change
    create_table :parklot_slots do |t|
      t.references :request, null: false, foreign_key: true
      t.references :truck, null: false, foreign_key: true
      t.date :date, null: false
      t.string :slot_type, null: false, default: "pickup"
      t.boolean :is_moving_day, null: false, default: false
      t.integer :start_minutes, null: false
      t.integer :end_minutes, null: false
      t.timestamps
    end

    add_index :parklot_slots, [:date, :truck_id]
    add_index :parklot_slots, [:request_id, :truck_id, :date, :slot_type],
              unique: true, name: "index_parklot_slots_uniqueness"
    add_index :parklot_slots, :slot_type  # For filtering by purpose
    add_index :parklot_slots, :is_moving_day  # For moving day queries
  end
end

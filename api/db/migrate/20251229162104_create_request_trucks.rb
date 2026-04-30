class CreateRequestTrucks < ActiveRecord::Migration[8.0]
  def change
    create_table :request_trucks do |t|
      t.references :request, null: false, foreign_key: true
      t.references :truck, null: false, foreign_key: true
      t.string :purpose, null: false, default: "pickup"

      t.timestamps
    end

    add_index :request_trucks, :purpose
    add_index :request_trucks, [ :request_id, :truck_id, :purpose ], unique: true,
              name: "index_request_trucks_on_request_truck_purpose"
  end
end

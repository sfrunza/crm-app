class CreateRequestRooms < ActiveRecord::Migration[8.0]
  def change
    create_table :request_rooms do |t|
      t.references :request, null: false, foreign_key: true
      t.references :room, foreign_key: true # optional template link

      t.string :name, null: false
      t.boolean :is_custom, default: false, null: false
      t.integer :position, default: 0

      t.timestamps
    end

    add_index :request_rooms, [ :request_id, :position ]
    add_index :request_rooms, [ :request_id, :name ]
  end
end

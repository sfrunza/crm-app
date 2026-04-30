class CreateMoveSizeRooms < ActiveRecord::Migration[8.0]
  def change
    create_table :move_size_rooms do |t|
      t.references :move_size, null: false, foreign_key: true
      t.references :room, null: false, foreign_key: true

      t.integer :kind, null: false # 0 default, 1 suggested
      t.integer :position, default: 0
      t.jsonb :items, default: {}, null: false

      t.timestamps
    end

    add_index :move_size_rooms, [ :move_size_id, :position ]
  end
end

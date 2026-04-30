class CreateItemRoomCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :item_room_categories do |t|
      t.references :item, null: false, foreign_key: true
      t.references :room, null: false, foreign_key: true

      t.timestamps
    end

    add_index :item_room_categories, [ :item_id, :room_id ], unique: true
  end
end

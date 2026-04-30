class CreateRequestItems < ActiveRecord::Migration[8.0]
  def change
    create_table :request_items do |t|
      t.references :request_room, null: false, foreign_key: true
      t.references :item, foreign_key: true # optional template link

      t.string :name, null: false
      t.text :description

      t.decimal :volume, precision: 8, scale: 2
      t.decimal :weight, precision: 8, scale: 2

      t.boolean :is_box, default: false, null: false
      t.boolean :is_furniture, default: true, null: false
      t.boolean :is_special_handling, default: false, null: false

      t.boolean :is_custom, default: false, null: false

      t.integer :quantity, default: 1, null: false

      t.timestamps
    end

    add_index :request_items, :is_special_handling
    add_index :request_items, [ :request_room_id, :name ]
  end
end

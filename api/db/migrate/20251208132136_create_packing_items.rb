class CreatePackingItems < ActiveRecord::Migration[8.0]
  def change
    create_table :packing_items do |t|
      t.string :name
      t.integer :price
      t.integer :position

      t.timestamps
    end
    add_index :packing_items, :position  # For ordering
  end
end

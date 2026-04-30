class CreatePackingTypes < ActiveRecord::Migration[8.0]
  def change
    create_table :packing_types do |t|
      t.string :name
      t.text :description
      t.boolean :is_default, default: false
      t.integer :labor_increase
      t.integer :position

      t.timestamps
    end
    add_index :packing_types, :is_default  # For finding default packing type
    add_index :packing_types, :position  # For ordering
  end
end

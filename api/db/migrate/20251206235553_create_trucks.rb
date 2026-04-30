class CreateTrucks < ActiveRecord::Migration[8.0]
  def change
    create_table :trucks do |t|
      t.string :name
      t.boolean :active, default: true
      t.integer :position

      t.timestamps
    end
    add_index :trucks, :active  # For filtering active trucks
    add_index :trucks, :position  # For ordering
  end
end

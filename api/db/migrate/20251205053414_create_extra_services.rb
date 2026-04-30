class CreateExtraServices < ActiveRecord::Migration[8.0]
  def change
    create_table :extra_services do |t|
      t.string :name
      t.integer :price
      t.boolean :active, default: true
      t.integer :position

      t.timestamps
    end
    add_index :extra_services, :active  # For filtering active services
    add_index :extra_services, :position  # For ordering
  end
end

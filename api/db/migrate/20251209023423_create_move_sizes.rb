class CreateMoveSizes < ActiveRecord::Migration[8.0]
  def change
    create_table :move_sizes do |t|
      t.string :name, null: false
      t.text :description
      t.integer :position, default: 0, null: false

      # business configuration
      t.integer :dispersion
      t.integer :truck_count
      t.jsonb :crew_size_settings, default: [], null: false

      t.timestamps
    end
    add_index :move_sizes, :name, unique: true
    add_index :move_sizes, :position
  end
end

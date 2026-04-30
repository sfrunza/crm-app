class CreateServices < ActiveRecord::Migration[8.0]
  def change
    create_table :services do |t|
      t.string :name
      t.boolean :active, default: true
      t.integer :miles_setting, default: 0
      t.integer :position
      t.boolean :is_default, default: false
      t.string :code

      t.timestamps
    end
    add_index :services, :code, unique: true
  end
end

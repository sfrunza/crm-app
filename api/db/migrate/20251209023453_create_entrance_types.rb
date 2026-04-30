class CreateEntranceTypes < ActiveRecord::Migration[8.0]
  def change
    create_table :entrance_types do |t|
      t.string  :name,      null: false
      t.string  :form_name, null: false
      t.integer :position,  null: false, default: 0

      t.timestamps
    end
    add_index :entrance_types, :position
    add_index :entrance_types, :name, unique: true
    add_index :entrance_types, :form_name, unique: true
  end
end

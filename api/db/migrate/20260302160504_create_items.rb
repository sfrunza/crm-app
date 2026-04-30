class CreateItems < ActiveRecord::Migration[8.0]
  def change
    create_table :items do |t|
      t.string :name, null: false
      t.text :description

      t.decimal :volume, precision: 8, scale: 2
      t.decimal :weight, precision: 8, scale: 2

      t.boolean :is_box, default: false, null: false
      t.boolean :is_furniture, default: true, null: false
      t.boolean :is_special_handling, default: false, null: false

      t.integer :position, default: 0, null: false
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :items, :name
    add_index :items, :position
  end
end

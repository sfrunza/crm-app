class CreateFolders < ActiveRecord::Migration[8.0]
  def change
    create_table :folders do |t|
      t.string  :name,        null: false
      t.integer :position,    null: false, default: 0
      t.boolean :is_default,  null: false, default: false

      t.timestamps
    end
    add_index :folders, :name, unique: true
    add_index :folders, :position
  end
end

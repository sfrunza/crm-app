class CreateGlobalSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :global_settings do |t|
      t.integer :singleton_guard, null: false, default: 0

      t.timestamps
    end
    add_index :global_settings, :singleton_guard, unique: true
  end
end

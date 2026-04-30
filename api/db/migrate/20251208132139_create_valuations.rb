class CreateValuations < ActiveRecord::Migration[8.0]
  def change
    create_table :valuations do |t|
      t.string :name
      t.text :description
      t.boolean :is_default, default: false
      t.boolean :active, default: true

      t.timestamps
    end
    add_index :valuations, :is_default  # For finding default valuation
    add_index :valuations, :active  # For filtering active valuations
  end
end

class CreateRequestMovers < ActiveRecord::Migration[8.0]
  def change
    create_table :request_movers do |t|
      t.references :request, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: { to_table: :users }
      t.string :purpose, null: false, default: "pickup"

      t.timestamps
    end

    add_index :request_movers, :purpose
    add_index :request_movers, [ :request_id, :user_id, :purpose ], unique: true,
              name: "index_request_movers_on_request_user_purpose"
  end
end

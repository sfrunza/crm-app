class CreatePayments < ActiveRecord::Migration[8.0]
  def change
    create_table :payments do |t|
      t.references :request, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :payment_type, null: false, default: 0
      t.integer :amount, null: false
      t.integer :status, null: false, default: 0
      t.string :stripe_payment_intent_id
      t.string :card_brand
      t.string :card_last_four
      t.string :description
      t.integer :refunded_amount, default: 0, null: false
      t.jsonb :metadata, default: {}, null: false

      t.timestamps
    end

    add_index :payments, :stripe_payment_intent_id, unique: true
    add_index :payments, :payment_type
    add_index :payments, :status
    add_index :payments, [ :request_id, :status ]  # For payment status queries
    add_index :payments, [ :user_id, :created_at ]  # For user payment history
    add_index :payments, :created_at  # For reporting
  end
end

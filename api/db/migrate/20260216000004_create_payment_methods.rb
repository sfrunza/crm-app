class CreatePaymentMethods < ActiveRecord::Migration[8.0]
  def change
    create_table :payment_methods do |t|
      t.references :user, null: false, foreign_key: true
      t.string :stripe_payment_method_id, null: false
      t.string :card_brand
      t.string :card_last_four
      t.integer :card_exp_month
      t.integer :card_exp_year
      t.boolean :is_default, default: false, null: false

      t.timestamps
    end

    add_index :payment_methods, :stripe_payment_method_id, unique: true
    add_index :payment_methods, [ :user_id, :is_default ]
  end
end

class CreateInvoices < ActiveRecord::Migration[8.0]
  def change
    create_table :invoices do |t|
      t.references :request, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :amount, null: false
      t.integer :status, null: false, default: 0
      t.date :due_date
      t.text :description
      t.datetime :paid_at
      t.datetime :sent_at

      # Custom invoice system fields
      t.string :email
      t.string :client_name
      t.text :client_address
      t.string :invoice_number
      t.integer :subtotal, default: 0, null: false
      t.decimal :processing_fee_percent, precision: 5, scale: 2, default: 0
      t.integer :processing_fee_amount, default: 0, null: false
      t.decimal :discount_percent, precision: 5, scale: 2, default: 0
      t.integer :discount_amount, default: 0, null: false
      t.decimal :tax_percent, precision: 5, scale: 2, default: 0
      t.integer :tax_amount, default: 0, null: false
      t.text :notes
      t.string :token

      t.timestamps
    end

    add_index :invoices, :status
    add_index :invoices, :token, unique: true
    add_index :invoices, :invoice_number
    add_index :invoices, :due_date  # For overdue queries
    add_index :invoices, :paid_at  # For paid invoice queries
    add_index :invoices, :sent_at  # For sent invoice queries

    # Composite indexes
    add_index :invoices, [ :status, :due_date ]  # For invoice dashboard
    add_index :invoices, [ :user_id, :created_at ]  # For user invoice history

    create_table :invoice_items do |t|
      t.references :invoice, null: false, foreign_key: true
      t.string :description, null: false
      t.integer :quantity, null: false, default: 1
      t.integer :unit_price, null: false, default: 0
      t.integer :amount, null: false, default: 0
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :invoice_items, :position
  end
end

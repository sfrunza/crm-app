class CreateUsers < ActiveRecord::Migration[8.0]
  create_enum :user_role, %w[customer helper driver foreman manager admin]

  def change
    create_table :users do |t|
      t.string :email_address, null: false
      t.string :password_digest, null: false
      t.string :first_name
      t.string :last_name
      t.string :phone
      t.boolean :active, default: true
      t.enum :role, enum_type: :user_role, default: "customer", null: false
      t.string :additional_email
      t.string :additional_phone

      t.timestamps
    end
    add_index :users, :email_address,
              using: :gin,
              opclass: :gin_trgm_ops
    add_index :users, :first_name, using: :gin, opclass: :gin_trgm_ops
    add_index :users, :last_name, using: :gin, opclass: :gin_trgm_ops
    add_index :users, :phone, using: :gin, opclass: :gin_trgm_ops
    add_index :users, :role
    add_index :users, :active
    add_index :users, [ :active, :role ]
  end
end

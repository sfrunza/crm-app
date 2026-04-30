class CreateEmailTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :email_templates do |t|
      t.references :folder, null: false, foreign_key: true

      t.string  :name, null: false
      t.string  :event_key
      t.string  :subject, null: false

      t.text    :html, null: false
      t.jsonb   :design, null: false
      t.jsonb   :variables, null: false, default: {}

      t.integer :position, null: false, default: 0
      t.boolean :active, null: false, default: true
      t.boolean :system, null: false, default: false

      t.timestamps
    end

    add_index :email_templates, :event_key, unique: true, where: "event_key IS NOT NULL"
    add_index :email_templates, %i[folder_id name], unique: true
    add_index :email_templates, :position
    add_index :email_templates, :active  # For filtering active templates
    add_index :email_templates, :system  # For filtering system templates
  end
end

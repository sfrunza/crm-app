class CreateRequestLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :request_logs do |t|
      t.references :request, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true
      t.string :action, null: false
      t.jsonb :details, default: {}, null: false
      t.string :ip_address
      t.string :device_type
      t.string :browser
      t.string :platform
      t.string :user_agent

      t.timestamps
    end

    add_index :request_logs, :action
    add_index :request_logs, :created_at

    # Composite indexes for common query patterns
    add_index :request_logs, [ :request_id, :created_at ]  # For request history
    add_index :request_logs, [ :user_id, :created_at ]  # For user activity
    add_index :request_logs, [ :action, :created_at ]  # For activity reports
  end
end

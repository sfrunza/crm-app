class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages do |t|
      t.references :request, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :content, null: false

      # Track which users have viewed this message
      t.jsonb :viewed_by, default: [], null: false

      # Track which users were notified about this message
      # (e.g., when customer sends message, notify admin/manager)
      t.jsonb :notified_user_ids, default: [], null: false

      t.timestamps
    end

    add_index :messages, :created_at  # For ordering

    # GIN index for efficient queries on viewed_by array
    add_index :messages, :viewed_by, using: :gin
    # GIN index for notified_user_ids array
    add_index :messages, :notified_user_ids, using: :gin

    # Composite index for ordered message threads
    add_index :messages, [ :request_id, :created_at ]
  end
end

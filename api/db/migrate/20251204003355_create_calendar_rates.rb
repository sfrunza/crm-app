class CreateCalendarRates < ActiveRecord::Migration[8.0]
  def change
    create_table :calendar_rates do |t|
      t.date :date, null: false
      t.boolean :enable_automation, default: false
      t.boolean :enable_auto_booking, default: false
      t.boolean :is_blocked, default: false
      t.references :rate, null: true, foreign_key: true

      t.timestamps
    end
    add_index :calendar_rates, :date
    add_index :calendar_rates, [ :date, :rate_id ]
  end
end

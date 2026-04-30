# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_27_211733) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "user_role", ["customer", "helper", "driver", "foreman", "manager", "admin"]

  create_table "action_text_rich_texts", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "calendar_rates", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.boolean "enable_auto_booking", default: false
    t.boolean "enable_automation", default: false
    t.boolean "is_blocked", default: false
    t.bigint "rate_id"
    t.datetime "updated_at", null: false
    t.index ["date", "rate_id"], name: "index_calendar_rates_on_date_and_rate_id"
    t.index ["date"], name: "index_calendar_rates_on_date"
    t.index ["rate_id"], name: "index_calendar_rates_on_rate_id"
  end

  create_table "email_templates", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.jsonb "design", null: false
    t.string "event_key"
    t.bigint "folder_id", null: false
    t.text "html", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.string "subject", null: false
    t.boolean "system", default: false, null: false
    t.datetime "updated_at", null: false
    t.jsonb "variables", default: {}, null: false
    t.index ["active"], name: "index_email_templates_on_active"
    t.index ["event_key"], name: "index_email_templates_on_event_key", unique: true, where: "(event_key IS NOT NULL)"
    t.index ["folder_id", "name"], name: "index_email_templates_on_folder_id_and_name", unique: true
    t.index ["folder_id"], name: "index_email_templates_on_folder_id"
    t.index ["position"], name: "index_email_templates_on_position"
    t.index ["system"], name: "index_email_templates_on_system"
  end

  create_table "entrance_types", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "form_name", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["form_name"], name: "index_entrance_types_on_form_name", unique: true
    t.index ["name"], name: "index_entrance_types_on_name", unique: true
    t.index ["position"], name: "index_entrance_types_on_position"
  end

  create_table "extra_services", force: :cascade do |t|
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "position"
    t.integer "price"
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_extra_services_on_active"
    t.index ["position"], name: "index_extra_services_on_position"
  end

  create_table "folders", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "is_default", default: false, null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_folders_on_name", unique: true
    t.index ["position"], name: "index_folders_on_position"
  end

  create_table "global_settings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "singleton_guard", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["singleton_guard"], name: "index_global_settings_on_singleton_guard", unique: true
  end

  create_table "invoice_items", force: :cascade do |t|
    t.integer "amount", default: 0, null: false
    t.datetime "created_at", null: false
    t.string "description", null: false
    t.bigint "invoice_id", null: false
    t.integer "position", default: 0, null: false
    t.integer "quantity", default: 1, null: false
    t.integer "unit_price", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["invoice_id"], name: "index_invoice_items_on_invoice_id"
    t.index ["position"], name: "index_invoice_items_on_position"
  end

  create_table "invoices", force: :cascade do |t|
    t.integer "amount", null: false
    t.text "client_address"
    t.string "client_name"
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "discount_amount", default: 0, null: false
    t.decimal "discount_percent", precision: 5, scale: 2, default: "0.0"
    t.date "due_date"
    t.string "email"
    t.string "invoice_number"
    t.text "notes"
    t.datetime "paid_at"
    t.integer "processing_fee_amount", default: 0, null: false
    t.decimal "processing_fee_percent", precision: 5, scale: 2, default: "0.0"
    t.bigint "request_id", null: false
    t.datetime "sent_at"
    t.integer "status", default: 0, null: false
    t.integer "subtotal", default: 0, null: false
    t.integer "tax_amount", default: 0, null: false
    t.decimal "tax_percent", precision: 5, scale: 2, default: "0.0"
    t.string "token"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["due_date"], name: "index_invoices_on_due_date"
    t.index ["invoice_number"], name: "index_invoices_on_invoice_number"
    t.index ["paid_at"], name: "index_invoices_on_paid_at"
    t.index ["request_id"], name: "index_invoices_on_request_id"
    t.index ["sent_at"], name: "index_invoices_on_sent_at"
    t.index ["status", "due_date"], name: "index_invoices_on_status_and_due_date"
    t.index ["status"], name: "index_invoices_on_status"
    t.index ["token"], name: "index_invoices_on_token", unique: true
    t.index ["user_id", "created_at"], name: "index_invoices_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_invoices_on_user_id"
  end

  create_table "item_room_categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "item_id", null: false
    t.bigint "room_id", null: false
    t.datetime "updated_at", null: false
    t.index ["item_id", "room_id"], name: "index_item_room_categories_on_item_id_and_room_id", unique: true
    t.index ["item_id"], name: "index_item_room_categories_on_item_id"
    t.index ["room_id"], name: "index_item_room_categories_on_room_id"
  end

  create_table "items", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_box", default: false, null: false
    t.boolean "is_furniture", default: true, null: false
    t.boolean "is_special_handling", default: false, null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.decimal "volume", precision: 8, scale: 2
    t.decimal "weight", precision: 8, scale: 2
    t.index ["name"], name: "index_items_on_name"
    t.index ["position"], name: "index_items_on_position"
  end

  create_table "messages", force: :cascade do |t|
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.jsonb "notified_user_ids", default: [], null: false
    t.bigint "request_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.jsonb "viewed_by", default: [], null: false
    t.index ["created_at"], name: "index_messages_on_created_at"
    t.index ["notified_user_ids"], name: "index_messages_on_notified_user_ids", using: :gin
    t.index ["request_id", "created_at"], name: "index_messages_on_request_id_and_created_at"
    t.index ["request_id"], name: "index_messages_on_request_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
    t.index ["viewed_by"], name: "index_messages_on_viewed_by", using: :gin
  end

  create_table "move_size_rooms", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "items", default: {}, null: false
    t.integer "kind", null: false
    t.bigint "move_size_id", null: false
    t.integer "position", default: 0
    t.bigint "room_id", null: false
    t.datetime "updated_at", null: false
    t.index ["move_size_id", "position"], name: "index_move_size_rooms_on_move_size_id_and_position"
    t.index ["move_size_id"], name: "index_move_size_rooms_on_move_size_id"
    t.index ["room_id"], name: "index_move_size_rooms_on_room_id"
  end

  create_table "move_sizes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "crew_size_settings", default: [], null: false
    t.text "description"
    t.integer "dispersion"
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.integer "truck_count"
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_move_sizes_on_name", unique: true
    t.index ["position"], name: "index_move_sizes_on_position"
  end

  create_table "packing_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "position"
    t.integer "price"
    t.datetime "updated_at", null: false
    t.index ["position"], name: "index_packing_items_on_position"
  end

  create_table "packing_types", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_default", default: false
    t.integer "labor_increase"
    t.string "name"
    t.integer "position"
    t.datetime "updated_at", null: false
    t.index ["is_default"], name: "index_packing_types_on_is_default"
    t.index ["position"], name: "index_packing_types_on_position"
  end

  create_table "parklot_slots", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.integer "end_minutes", null: false
    t.boolean "is_moving_day", default: false, null: false
    t.bigint "request_id", null: false
    t.string "slot_type", default: "pickup", null: false
    t.integer "start_minutes", null: false
    t.bigint "truck_id", null: false
    t.datetime "updated_at", null: false
    t.index ["date", "truck_id"], name: "index_parklot_slots_on_date_and_truck_id"
    t.index ["is_moving_day"], name: "index_parklot_slots_on_is_moving_day"
    t.index ["request_id", "truck_id", "date", "slot_type"], name: "index_parklot_slots_uniqueness", unique: true
    t.index ["request_id"], name: "index_parklot_slots_on_request_id"
    t.index ["slot_type"], name: "index_parklot_slots_on_slot_type"
    t.index ["truck_id"], name: "index_parklot_slots_on_truck_id"
  end

  create_table "payment_methods", force: :cascade do |t|
    t.string "card_brand"
    t.integer "card_exp_month"
    t.integer "card_exp_year"
    t.string "card_last_four"
    t.datetime "created_at", null: false
    t.boolean "is_default", default: false, null: false
    t.string "stripe_payment_method_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["stripe_payment_method_id"], name: "index_payment_methods_on_stripe_payment_method_id", unique: true
    t.index ["user_id", "is_default"], name: "index_payment_methods_on_user_id_and_is_default"
    t.index ["user_id"], name: "index_payment_methods_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.integer "amount", null: false
    t.string "card_brand"
    t.string "card_last_four"
    t.datetime "created_at", null: false
    t.string "description"
    t.jsonb "metadata", default: {}, null: false
    t.integer "payment_type", default: 0, null: false
    t.integer "refunded_amount", default: 0, null: false
    t.bigint "request_id", null: false
    t.integer "status", default: 0, null: false
    t.string "stripe_payment_intent_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["created_at"], name: "index_payments_on_created_at"
    t.index ["payment_type"], name: "index_payments_on_payment_type"
    t.index ["request_id", "status"], name: "index_payments_on_request_id_and_status"
    t.index ["request_id"], name: "index_payments_on_request_id"
    t.index ["status"], name: "index_payments_on_status"
    t.index ["stripe_payment_intent_id"], name: "index_payments_on_stripe_payment_intent_id", unique: true
    t.index ["user_id", "created_at"], name: "index_payments_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_payments_on_user_id"
  end

  create_table "rates", force: :cascade do |t|
    t.boolean "active", default: true
    t.string "color"
    t.datetime "created_at", null: false
    t.integer "extra_mover_rate", default: 5000
    t.integer "extra_truck_rate", default: 5000
    t.boolean "is_default", default: false
    t.jsonb "movers_rates", default: {"2" => {"hourly_rate" => 10000}, "3" => {"hourly_rate" => 10000}, "4" => {"hourly_rate" => 10000}, "5" => {"hourly_rate" => 10000}, "6" => {"hourly_rate" => 10000}, "7" => {"hourly_rate" => 10000}, "8" => {"hourly_rate" => 10000}, "9" => {"hourly_rate" => 10000}, "10" => {"hourly_rate" => 10000}}
    t.string "name"
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_rates_on_active"
    t.index ["is_default"], name: "index_rates_on_is_default"
  end

  create_table "request_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_box", default: false, null: false
    t.boolean "is_custom", default: false, null: false
    t.boolean "is_furniture", default: true, null: false
    t.boolean "is_special_handling", default: false, null: false
    t.bigint "item_id"
    t.string "name", null: false
    t.integer "quantity", default: 1, null: false
    t.bigint "request_room_id", null: false
    t.datetime "updated_at", null: false
    t.decimal "volume", precision: 8, scale: 2
    t.decimal "weight", precision: 8, scale: 2
    t.index ["is_special_handling"], name: "index_request_items_on_is_special_handling"
    t.index ["item_id"], name: "index_request_items_on_item_id"
    t.index ["request_room_id", "name"], name: "index_request_items_on_request_room_id_and_name"
    t.index ["request_room_id"], name: "index_request_items_on_request_room_id"
  end

  create_table "request_logs", force: :cascade do |t|
    t.string "action", null: false
    t.string "browser"
    t.datetime "created_at", null: false
    t.jsonb "details", default: {}, null: false
    t.string "device_type"
    t.string "ip_address"
    t.string "platform"
    t.bigint "request_id", null: false
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id"
    t.index ["action", "created_at"], name: "index_request_logs_on_action_and_created_at"
    t.index ["action"], name: "index_request_logs_on_action"
    t.index ["created_at"], name: "index_request_logs_on_created_at"
    t.index ["request_id", "created_at"], name: "index_request_logs_on_request_id_and_created_at"
    t.index ["request_id"], name: "index_request_logs_on_request_id"
    t.index ["user_id", "created_at"], name: "index_request_logs_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_request_logs_on_user_id"
  end

  create_table "request_movers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "purpose", default: "pickup", null: false
    t.bigint "request_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["purpose"], name: "index_request_movers_on_purpose"
    t.index ["request_id", "user_id", "purpose"], name: "index_request_movers_on_request_user_purpose", unique: true
    t.index ["request_id"], name: "index_request_movers_on_request_id"
    t.index ["user_id"], name: "index_request_movers_on_user_id"
  end

  create_table "request_rooms", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "is_custom", default: false, null: false
    t.string "name", null: false
    t.integer "position", default: 0
    t.bigint "request_id", null: false
    t.bigint "room_id"
    t.datetime "updated_at", null: false
    t.index ["request_id", "name"], name: "index_request_rooms_on_request_id_and_name"
    t.index ["request_id", "position"], name: "index_request_rooms_on_request_id_and_position"
    t.index ["request_id"], name: "index_request_rooms_on_request_id"
    t.index ["room_id"], name: "index_request_rooms_on_room_id"
  end

  create_table "request_trucks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "purpose", default: "pickup", null: false
    t.bigint "request_id", null: false
    t.bigint "truck_id", null: false
    t.datetime "updated_at", null: false
    t.index ["purpose"], name: "index_request_trucks_on_purpose"
    t.index ["request_id", "truck_id", "purpose"], name: "index_request_trucks_on_request_truck_purpose", unique: true
    t.index ["request_id"], name: "index_request_trucks_on_request_id"
    t.index ["truck_id"], name: "index_request_trucks_on_truck_id"
  end

  create_table "requests", force: :cascade do |t|
    t.jsonb "balance", default: {"max" => 0, "min" => 0}, null: false
    t.datetime "booked_at"
    t.boolean "can_edit_request", default: true, null: false
    t.datetime "created_at", null: false
    t.integer "crew_size"
    t.integer "crew_size_delivery"
    t.bigint "customer_id"
    t.text "customer_notes"
    t.date "delivery_date_window_end"
    t.date "delivery_date_window_start"
    t.bigint "delivery_foreman_id"
    t.integer "deposit", default: 10000
    t.jsonb "destination", default: {"apt" => "", "zip" => "", "city" => "", "state" => "", "street" => "", "floor_id" => nil, "location" => {"lat" => 0, "lng" => 0}}, null: false
    t.jsonb "details", default: {"comments" => "", "is_touched" => false, "bulky_items_question_answer" => "", "delicate_items_question_answer" => "", "disassemble_items_question_answer" => ""}, null: false
    t.jsonb "directions", default: {}, null: false
    t.jsonb "discount", default: {"total" => 0, "value" => 0, "percent" => 0}, null: false
    t.text "dispatch_notes"
    t.text "driver_notes"
    t.integer "end_time_window"
    t.integer "end_time_window_delivery"
    t.integer "end_time_window_schedule"
    t.jsonb "extra_services", default: [], null: false
    t.integer "extra_services_total", default: 0
    t.bigint "foreman_id"
    t.jsonb "fuel", default: {"total" => 0, "value" => 0, "percent" => 0}, null: false
    t.jsonb "grand_total", default: {"max" => 0, "min" => 0}, null: false
    t.boolean "is_calculator_enabled", default: true
    t.boolean "is_delivery_now", default: false
    t.boolean "is_deposit_accepted", default: false
    t.boolean "is_moving_from_storage", default: false
    t.boolean "is_same_day_delivery", default: false
    t.jsonb "labor_price", default: {"max" => 0, "min" => 0}, null: false
    t.integer "min_total_time", default: 120, null: false
    t.bigint "move_size_id"
    t.jsonb "move_size_snapshot"
    t.date "moving_date"
    t.jsonb "origin", default: {"apt" => "", "zip" => "", "city" => "", "state" => "", "street" => "", "floor_id" => nil, "location" => {"lat" => 0, "lng" => 0}}, null: false
    t.jsonb "packing_items", default: [], null: false
    t.integer "packing_items_total", default: 0
    t.bigint "packing_type_id", null: false
    t.bigint "paired_request_id"
    t.integer "rate", default: 0
    t.text "sales_notes"
    t.date "schedule_date_window_end"
    t.date "schedule_date_window_start"
    t.jsonb "selected_suggested_room_ids", default: []
    t.bigint "service_id", null: false
    t.datetime "signed_at"
    t.integer "start_time_window"
    t.integer "start_time_window_delivery"
    t.integer "start_time_window_schedule"
    t.integer "status", default: 0, null: false
    t.jsonb "stops", default: [], null: false
    t.integer "total_boxes", default: 0
    t.integer "total_items", default: 0
    t.jsonb "total_time", default: {"max" => 0, "min" => 0}
    t.decimal "total_volume", precision: 10, scale: 2, default: "0.0"
    t.decimal "total_weight", precision: 10, scale: 2, default: "0.0"
    t.jsonb "transportation", default: {"max" => 0, "min" => 0}
    t.integer "travel_time", default: 0
    t.datetime "updated_at", null: false
    t.jsonb "valuation", default: {"name" => "", "total" => 0, "description" => "", "valuation_id" => nil}, null: false
    t.jsonb "work_time", default: {"max" => 0, "min" => 0}
    t.index ["booked_at"], name: "index_requests_on_booked_at"
    t.index ["can_edit_request"], name: "index_requests_on_can_edit_request"
    t.index ["created_at"], name: "index_requests_on_created_at"
    t.index ["customer_id", "status"], name: "index_requests_on_customer_id_and_status"
    t.index ["customer_id"], name: "index_requests_on_customer_id"
    t.index ["delivery_date_window_end"], name: "index_requests_on_delivery_date_window_end"
    t.index ["delivery_date_window_start"], name: "index_requests_on_delivery_date_window_start"
    t.index ["delivery_foreman_id"], name: "index_requests_on_delivery_foreman_id"
    t.index ["foreman_id", "status"], name: "index_requests_on_foreman_id_and_status"
    t.index ["foreman_id"], name: "index_requests_on_foreman_id"
    t.index ["is_calculator_enabled"], name: "index_requests_on_is_calculator_enabled"
    t.index ["is_deposit_accepted"], name: "index_requests_on_is_deposit_accepted"
    t.index ["is_moving_from_storage"], name: "index_requests_on_is_moving_from_storage"
    t.index ["is_same_day_delivery"], name: "index_requests_on_is_same_day_delivery"
    t.index ["move_size_id"], name: "index_requests_on_move_size_id"
    t.index ["moving_date", "status"], name: "index_requests_on_moving_date_and_status"
    t.index ["moving_date"], name: "index_requests_on_moving_date"
    t.index ["packing_type_id"], name: "index_requests_on_packing_type_id"
    t.index ["paired_request_id"], name: "index_requests_on_paired_request_id"
    t.index ["schedule_date_window_end"], name: "index_requests_on_schedule_date_window_end"
    t.index ["schedule_date_window_start"], name: "index_requests_on_schedule_date_window_start"
    t.index ["service_id"], name: "index_requests_on_service_id"
    t.index ["signed_at"], name: "index_requests_on_signed_at"
    t.index ["status", "created_at"], name: "index_requests_on_status_and_created_at"
    t.index ["status", "moving_date"], name: "index_requests_on_status_and_moving_date"
    t.index ["status"], name: "index_requests_on_status"
    t.index ["updated_at"], name: "index_requests_on_updated_at"
  end

  create_table "rooms", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_rooms_on_name", unique: true
    t.index ["position"], name: "index_rooms_on_position"
  end

  create_table "services", force: :cascade do |t|
    t.boolean "active", default: true
    t.string "code"
    t.datetime "created_at", null: false
    t.boolean "is_default", default: false
    t.integer "miles_setting", default: 0
    t.string "name"
    t.integer "position"
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_services_on_code", unique: true
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.string "token"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["created_at"], name: "index_sessions_on_created_at"
    t.index ["token"], name: "index_sessions_on_token", unique: true
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "settings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "value"
    t.string "var", null: false
    t.index ["var"], name: "index_settings_on_var", unique: true
  end

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.bigint "channel_hash", null: false
    t.datetime "created_at", null: false
    t.binary "payload", null: false
    t.index ["channel"], name: "index_solid_cable_messages_on_channel"
    t.index ["channel_hash"], name: "index_solid_cable_messages_on_channel_hash"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.datetime "created_at", null: false
    t.binary "key", null: false
    t.bigint "key_hash", null: false
    t.binary "value", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.string "concurrency_key", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error"
    t.bigint "job_id", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "active_job_id"
    t.text "arguments"
    t.string "class_name", null: false
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "finished_at"
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "queue_name", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "hostname"
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.text "metadata"
    t.string "name", null: false
    t.integer "pid", null: false
    t.bigint "supervisor_id"
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "run_at", null: false
    t.string "task_key", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.text "arguments"
    t.string "class_name"
    t.string "command", limit: 2048
    t.datetime "created_at", null: false
    t.text "description"
    t.string "key", null: false
    t.integer "priority", default: 0
    t.string "queue_name"
    t.string "schedule", null: false
    t.boolean "static", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "value", default: 1, null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "trucks", force: :cascade do |t|
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "position"
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_trucks_on_active"
    t.index ["position"], name: "index_trucks_on_position"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "active", default: true
    t.string "additional_email"
    t.string "additional_phone"
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "first_name"
    t.string "last_name"
    t.string "password_digest", null: false
    t.string "phone"
    t.enum "role", default: "customer", null: false, enum_type: "user_role"
    t.string "stripe_customer_id"
    t.datetime "updated_at", null: false
    t.index ["active", "role"], name: "index_users_on_active_and_role"
    t.index ["active"], name: "index_users_on_active"
    t.index ["email_address"], name: "index_users_on_email_address", opclass: :gin_trgm_ops, using: :gin
    t.index ["first_name"], name: "index_users_on_first_name", opclass: :gin_trgm_ops, using: :gin
    t.index ["last_name"], name: "index_users_on_last_name", opclass: :gin_trgm_ops, using: :gin
    t.index ["phone"], name: "index_users_on_phone", opclass: :gin_trgm_ops, using: :gin
    t.index ["role"], name: "index_users_on_role"
    t.index ["stripe_customer_id"], name: "index_users_on_stripe_customer_id", unique: true
  end

  create_table "valuations", force: :cascade do |t|
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_default", default: false
    t.string "name"
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_valuations_on_active"
    t.index ["is_default"], name: "index_valuations_on_is_default"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "calendar_rates", "rates"
  add_foreign_key "email_templates", "folders"
  add_foreign_key "invoice_items", "invoices"
  add_foreign_key "invoices", "requests"
  add_foreign_key "invoices", "users"
  add_foreign_key "item_room_categories", "items"
  add_foreign_key "item_room_categories", "rooms"
  add_foreign_key "messages", "requests"
  add_foreign_key "messages", "users"
  add_foreign_key "move_size_rooms", "move_sizes"
  add_foreign_key "move_size_rooms", "rooms"
  add_foreign_key "parklot_slots", "requests"
  add_foreign_key "parklot_slots", "trucks"
  add_foreign_key "payment_methods", "users"
  add_foreign_key "payments", "requests"
  add_foreign_key "payments", "users"
  add_foreign_key "request_items", "items"
  add_foreign_key "request_items", "request_rooms"
  add_foreign_key "request_logs", "requests"
  add_foreign_key "request_logs", "users"
  add_foreign_key "request_movers", "requests"
  add_foreign_key "request_movers", "users"
  add_foreign_key "request_rooms", "requests"
  add_foreign_key "request_rooms", "rooms"
  add_foreign_key "request_trucks", "requests"
  add_foreign_key "request_trucks", "trucks"
  add_foreign_key "requests", "move_sizes"
  add_foreign_key "requests", "packing_types"
  add_foreign_key "requests", "requests", column: "paired_request_id"
  add_foreign_key "requests", "services"
  add_foreign_key "requests", "users", column: "customer_id"
  add_foreign_key "requests", "users", column: "delivery_foreman_id"
  add_foreign_key "requests", "users", column: "foreman_id"
  add_foreign_key "sessions", "users"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
end

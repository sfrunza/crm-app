# Unified configuration for request activity logs.
#
# Every tracked field is declared once in FIELD_CONFIG with its label
# and optional FK resolver. The frontend handles all display formatting.
# The backend only resolves FK IDs to human-readable names (since the
# frontend can't look up database records).
#
# Usage:
#   resolver = RequestLogResolver.new
#   details  = resolver.build_details("service_id", 1, 3)
#   # => { field: "service_id", label: "Service",
#   #      old_value: 1, new_value: 3,
#   #      old_display: "Local Moving", new_display: "Long Distance" }
#
#   resolver.build_details("crew_size", 2, 4)
#   # => { field: "crew_size", label: "Crew size",
#   #      old_value: 2, new_value: 4 }
#
class RequestLogResolver
  # ─── Unified Field Configuration ────────────────────────────────────
  #
  # Each entry maps a tracked field name to:
  #   label:   Human-readable label shown in the log
  #   resolve: (optional) Hash with FK resolver config:
  #            model:   ActiveRecord model class name (string, lazy-loaded)
  #            display: Lambda receiving the record, returning a display string
  #
  FIELD_CONFIG = {
    # ── Status ──
    "status"                     => { label: "Status" },

    # ── Date fields ──
    "moving_date"                => { label: "Moving date" },
    "delivery_date_window_start" => { label: "Delivery date start" },
    "delivery_date_window_end"   => { label: "Delivery date end" },
    "schedule_date_window_start" => { label: "Schedule date start" },
    "schedule_date_window_end"   => { label: "Schedule date end" },
    "booked_at"                  => { label: "Booked at" },

    # ── Time-of-day fields (integer minutes since midnight) ──
    "start_time_window"          => { label: "Start time" },
    "end_time_window"            => { label: "End time" },
    "start_time_window_delivery" => { label: "Delivery start time" },
    "end_time_window_delivery"   => { label: "Delivery end time" },
    "start_time_window_schedule" => { label: "Schedule start time" },
    "end_time_window_schedule"   => { label: "Schedule end time" },

    # ── Boolean fields ──
    "is_same_day_delivery"       => { label: "Same day delivery" },
    "is_delivery_now"            => { label: "Delivery now" },
    "is_calculator_enabled"      => { label: "Calculator enabled" },
    "is_moving_from_storage"     => { label: "Moving from storage" },
    "is_deposit_accepted"        => { label: "Deposit accepted" },

    # ── Numeric fields ──
    "crew_size"                  => { label: "Crew size" },
    "crew_size_delivery"         => { label: "Delivery crew size" },
    "travel_time"                => { label: "Travel time" },
    "min_total_time"             => { label: "Minimum total time" },

    # ── Currency fields (stored in cents) ──
    "rate"                       => { label: "Rate" },
    "deposit"                    => { label: "Deposit" },
    "extra_services_total"       => { label: "Extra services total" },
    "packing_items_total"        => { label: "Packing items total" },
    "fuel"                       => { label: "Fuel" },
    "discount"                   => { label: "Discount" },

    # ── Address fields (JSON object) ──
    "origin"                     => { label: "Origin" },
    "destination"                => { label: "Destination" },

    # ── List / array fields ──
    "stops"                      => { label: "Stops" },
    "extra_services"             => { label: "Extra services" },
    "packing_items"              => { label: "Packing supplies" },

    # ── Object / composite fields ──
    "details"                    => { label: "Details" },
    "work_time"                  => { label: "Work time" },
    "total_time"                 => { label: "Total time" },
    "transportation"             => { label: "Transportation" },
    "valuation"                  => { label: "Valuation" },

    # ── Foreign-key fields (resolved to human-readable names) ──
    "customer_id" => {
      label: "Customer",
      resolve: { model: "User",
                 display: ->(r) { [ r.first_name, r.last_name ].map(&:presence).compact.join(" ").presence || r.email_address } }
    },
    "foreman_id" => {
      label: "Foreman",
      resolve: { model: "User",
                 display: ->(r) { [ r.first_name, r.last_name ].map(&:presence).compact.join(" ").presence || r.email_address } }
    },
    "service_id" => {
      label: "Service",
      resolve: { model: "Service", display: ->(r) { r.name } }
    },
    "packing_type_id" => {
      label: "Packing type",
      resolve: { model: "PackingType", display: ->(r) { r.name } }
    },
    "move_size_id" => {
      label: "Move size",
      resolve: { model: "MoveSize", display: ->(r) { r.name } }
    },
    "paired_request_id" => {
      label: "Paired request",
      resolve: { model: "Request", display: ->(r) { "##{r.id}" } }
    }
  }.freeze

  # Convenience: list of all tracked field names
  TRACKED_FIELDS = FIELD_CONFIG.keys.freeze

  # ─── Public API ──────────────────────────────────────────────────────

  # Build a details hash for a single field change.
  # Always includes field, label, old_value, new_value.
  # For FK fields, also includes old_display / new_display (resolved names).
  def build_details(field, old_value, new_value)
    config = FIELD_CONFIG[field] || { label: field.humanize }

    details = {
      field:     field,
      label:     config[:label],
      old_value: old_value,
      new_value: new_value
    }

    # Only FK fields get server-side display resolution
    if config[:resolve]
      details[:old_display] = resolve_fk(config, old_value)
      details[:new_display] = resolve_fk(config, new_value)
    end

    details
  end

  # Resolve a single FK value. Returns the display string or nil.
  def resolve(field, value)
    config = FIELD_CONFIG[field]
    return nil unless config&.dig(:resolve)
    return nil if value.nil?

    resolve_fk(config, value)
  end

  private

  def resolve_fk(config, value)
    return nil if value.nil?

    resolver_config = config[:resolve]
    return nil unless resolver_config

    record = resolver_config[:model].constantize.find_by(id: value)
    return nil unless record

    resolver_config[:display].call(record)
  end
end

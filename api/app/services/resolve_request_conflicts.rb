class ResolveRequestConflicts
  def self.call!(confirmed_request)
    return unless confirmed_request.status == "confirmed"

    # Find all other non-confirmed requests that have overlapping ParklotSlots
    # on the same truck/date/time as the just-confirmed request's slots.
    conflicting_request_ids = ParklotSlot
      .where(request_id: confirmed_request.id)
      .flat_map do |slot|
        ParklotSlot
          .where(truck_id: slot.truck_id, date: slot.date)
          .where.not(request_id: confirmed_request.id)
          .joins(:request)
          .where.not(requests: { status: "confirmed" })
          .where("parklot_slots.start_minutes < ? AND parklot_slots.end_minutes > ?",
                 slot.end_minutes, slot.start_minutes)
          .pluck(:request_id)
      end
      .uniq

    return if conflicting_request_ids.empty?

    Request
      .where(id: conflicting_request_ids)
      .update_all(
        status: Request.statuses[:pending_date],
        updated_at: Time.current
      )
  end
end

class ParklotSlot < ApplicationRecord
  belongs_to :request
  belongs_to :truck

  validates :date, :slot_type, :start_minutes, :end_minutes, presence: true
  validates :slot_type, inclusion: { in: %w[pickup delivery] }
  validates :truck_id, uniqueness: { scope: [ :request_id, :date, :slot_type ] }
end

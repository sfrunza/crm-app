class Request < ApplicationRecord
  enum :status, %i[
    pending
    pending_info
    pending_date
    hold
    not_confirmed
    confirmed
    not_available
    completed
    spam
    canceled
    refused
    closed
    expired
    archived
    reserved
  ], default: :pending

  # Associations
  belongs_to :customer,
             class_name: "User",
             foreign_key: "customer_id",
             optional: true
  belongs_to :foreman,
             class_name: "User",
             foreign_key: "foreman_id",
             optional: true
  belongs_to :delivery_foreman,
             class_name: "User",
             foreign_key: "delivery_foreman_id",
             optional: true
  belongs_to :service, optional: false
  belongs_to :packing_type,
             foreign_key: "packing_type_id",
             optional: true
  belongs_to :move_size, optional: true
  belongs_to :paired_request,
             class_name: "Request",
             foreign_key: "paired_request_id",
             optional: true

  has_rich_text :sales_notes
  has_rich_text :driver_notes
  has_rich_text :customer_notes
  has_rich_text :dispatch_notes

  # Join table associations
  has_many :request_movers, dependent: :destroy
  has_many :movers, through: :request_movers, source: :user

  has_many :request_trucks, dependent: :destroy
  has_many :trucks, through: :request_trucks

  # Purpose-scoped truck associations
  has_many :pickup_request_trucks, -> { where(purpose: "pickup") }, class_name: "RequestTruck"
  has_many :pickup_trucks, through: :pickup_request_trucks, source: :truck

  has_many :delivery_request_trucks, -> { where(purpose: "delivery") }, class_name: "RequestTruck"
  has_many :delivery_trucks, through: :delivery_request_trucks, source: :truck

  # Purpose-scoped mover associations
  has_many :pickup_request_movers, -> { where(purpose: "pickup") }, class_name: "RequestMover"
  has_many :pickup_movers, through: :pickup_request_movers, source: :user

  has_many :delivery_request_movers, -> { where(purpose: "delivery") }, class_name: "RequestMover"
  has_many :delivery_movers, through: :delivery_request_movers, source: :user

  has_many :parklot_slots, dependent: :destroy

  has_many :messages, dependent: :destroy
  has_many :request_logs, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :invoices, dependent: :destroy

  has_many :request_rooms, dependent: :destroy
  # has_many :request_items, through: :request_rooms

  # Attachments
  has_many_attached :images
  has_one_attached :customer_signature

  # Validations
  validates :service, presence: true

  # Scopes
  scope :by_status, ->(status) { where(status: status) }
  scope :by_moving_date, -> { order(moving_date: :asc) }
  scope :confirmed, -> { where(status: :confirmed) }
  scope :pending_requests, -> { where(status: [ :pending, :hold, :pending_info, :pending_date ]) }
  scope :on_date, ->(date) { where(moving_date: date) }

  # Data integrity callbacks (defaults only)
  before_validation :set_default_packing_type, on: :create
  before_create :set_default_valuation
  before_save :update_move_size_snapshot, if: :will_save_change_to_move_size_id?

  # Purpose-aware after_save callbacks for join table sync
  after_save :sync_pickup_trucks, if: -> { instance_variable_defined?(:@pending_pickup_truck_ids) }
  after_save :sync_delivery_trucks, if: -> { instance_variable_defined?(:@pending_delivery_truck_ids) }
  after_save :sync_pickup_movers, if: -> { instance_variable_defined?(:@pending_pickup_mover_ids) }
  after_save :sync_delivery_movers, if: -> { instance_variable_defined?(:@pending_delivery_mover_ids) }

  # ============================
  # PURPOSE-AWARE GETTERS / SETTERS
  # ============================

  def pickup_truck_ids
    pickup_request_trucks.pluck(:truck_id)
  end

  def pickup_truck_ids=(ids)
    @pending_pickup_truck_ids = Array(ids).map(&:to_i)
  end

  def delivery_truck_ids
    delivery_request_trucks.pluck(:truck_id)
  end

  def delivery_truck_ids=(ids)
    @pending_delivery_truck_ids = Array(ids).map(&:to_i)
  end

  def pickup_mover_ids
    pickup_request_movers.pluck(:user_id)
  end

  def pickup_mover_ids=(ids)
    @pending_pickup_mover_ids = Array(ids).map(&:to_i)
  end

  def delivery_mover_ids
    delivery_request_movers.pluck(:user_id)
  end

  def delivery_mover_ids=(ids)
    @pending_delivery_mover_ids = Array(ids).map(&:to_i)
  end

  def foreman_id_delivery
    delivery_foreman_id
  end

  def foreman_id_delivery=(val)
    self.delivery_foreman_id = val
  end

  def end_minute
    total_time_val = work_time["max"] + travel_time
    max_time = total_time_val > min_total_time ? total_time_val : min_total_time
    start_time_window + max_time
  end

  def pair_with(other_request)
    update!(paired_request: other_request, is_moving_from_storage: false)
    other_request.update!(
      paired_request: self,
      is_moving_from_storage: true,
      service_id: service_id
    )
  end

  def log_viewed
    RequestLog.log_viewed!(
      request: self,
      user: Current.user,
      session: Current.session
    )
  end

  def payments_total
    payments.successful.sum(:amount)
  end

  def all_request_items
    request_rooms.includes(:request_items).flat_map(&:request_items)
  end

  def total_volume
    request_rooms.includes(:request_items).sum do |room|
      room.request_items.sum(&:total_volume)
    end
  end

  def total_weight
    request_rooms.includes(:request_items).sum do |room|
      room.request_items.sum(&:total_weight)
    end
  end

  def refresh_inventory_totals!
    totals = RequestInventoryCalculator.new(self).totals

    update_columns(
      total_items: totals[:items],
      total_boxes: totals[:boxes],
      total_volume: totals[:volume],
      total_weight: totals[:weight],
      updated_at: Time.current
    )

    totals
  end

  # def special_handling_items
  #   request_rooms.joins(:request_items)
  #                .merge(RequestItem.where(special_handling: true))
  # end

  private

  def update_move_size_snapshot
    return unless move_size

    # simplest: just convert to JSON with as_json
    self.move_size_snapshot = MoveSizeSerializer.new(move_size).as_json
  end

  def set_default_packing_type
    self.packing_type ||= PackingType.find_by(is_default: true)
  end

  def set_default_valuation
    default_valuation = Valuation.find_by(is_default: true)
    return unless default_valuation

    self.valuation = {
      total: 0,
      description: default_valuation.description&.body&.to_html,
      name: default_valuation.name,
      valuation_id: default_valuation.id
    }
  end

  # ============================
  # PURPOSE-AWARE JOIN TABLE SYNC
  # ============================

  def sync_pickup_trucks
    sync_join_records(request_trucks, "pickup", :truck_id, @pending_pickup_truck_ids)
    remove_instance_variable(:@pending_pickup_truck_ids)
  end

  def sync_delivery_trucks
    sync_join_records(request_trucks, "delivery", :truck_id, @pending_delivery_truck_ids)
    remove_instance_variable(:@pending_delivery_truck_ids)
  end

  def sync_pickup_movers
    sync_join_records(request_movers, "pickup", :user_id, @pending_pickup_mover_ids)
    remove_instance_variable(:@pending_pickup_mover_ids)
  end

  def sync_delivery_movers
    sync_join_records(request_movers, "delivery", :user_id, @pending_delivery_mover_ids)
    remove_instance_variable(:@pending_delivery_mover_ids)
  end

  def sync_join_records(association, purpose, foreign_key, ids)
    scoped = association.where(purpose: purpose)
    scoped.where.not(foreign_key => ids).destroy_all
    existing = scoped.pluck(foreign_key)
    (ids - existing).each do |fk_id|
      association.create!(foreign_key => fk_id, purpose: purpose)
    end
  end
end

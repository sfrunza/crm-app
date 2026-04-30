class MoveSize < ApplicationRecord
  attr_accessor :remove_image

  # Validations
  validates :name, presence: true, length: { maximum: 255 }
  validates :truck_count, :dispersion, numericality: { only_integer: true }, allow_nil: true

  # Associations
  has_one_attached :image
  has_many :requests, dependent: :nullify
  has_many :move_size_rooms, dependent: :destroy
  has_many :default_rooms,
           -> { default_room.order(:position) },
           class_name: "MoveSizeRoom"

  has_many :suggested_rooms,
           -> { suggested_room.order(:position) },
           class_name: "MoveSizeRoom"

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  normalizes :description, with: ->(d) { d.strip }
  acts_as_list column: :position, top_of_list: 0
  after_commit :clear_cache
  before_save :assign_custom_image_key, if: :should_assign_image_key?

  DEFAULT_CREW_VALUE = 2


  # Preload heavy calculations properly
  def preload_items
    @preloaded_items ||= Item.where(id: all_item_ids).index_by(&:id)
  end

  def all_item_ids
    move_size_rooms.flat_map { |r| r.items.keys }.uniq
  end

  def total_volume
    items_map = preload_items

    move_size_rooms.sum do |room|
      room.items.sum do |item_id, quantity|
        item = items_map[item_id.to_i]
        item&.volume.to_f * quantity
      end
    end
  end

  def total_items
    move_size_rooms.sum(&:total_items)
  end

  def total_boxes
    move_size_rooms.sum(&:total_boxes)
  end

  # def total_volume
  #   move_size_rooms.sum(&:total_volume)
  # end


  # def total_items
  #   move_size_rooms.sum { |r| r.total_items }
  # end

  # def total_boxes
  #   move_size_rooms.sum { |r| r.total_boxes }
  # end

  # def total_volume
  #   move_size_rooms.sum { |r| r.total_volume }
  # end

  # def recalculate_volume_and_weight!
  #   total_volume = 0.0
  #   total_weight = 0.0

  #   default_move_size_rooms.each do |msr|
  #     totals = msr.send(:calculate_totals)
  #     total_volume += totals[:volume]
  #     total_weight += totals[:weight]
  #   end

  #   dispersion_pct = (dispersion || 0).to_f / 100.0

  #   update_columns(
  #     volume: total_volume.round(2),
  #     weight: total_weight.round(2),
  #     volume_with_dispersion: {
  #       "min" => (total_volume * (1 - dispersion_pct)).round(2),
  #       "max" => (total_volume * (1 + dispersion_pct)).round(2)
  #     }
  #   )
  # end

  def expand_crew_matrix!(default_value = DEFAULT_CREW_VALUE)
    matrix = (crew_size_settings || []).map(&:dup)
    current_rows = matrix.size
    current_cols = matrix.first&.size || 0
    new_size = EntranceType.count

    if new_size > current_cols
      matrix.each { |row| (new_size - current_cols).times { row << default_value } }
    end

    if new_size > current_rows
      (new_size - current_rows).times { matrix << Array.new(new_size, default_value) }
    end

    update!(crew_size_settings: matrix)
  end

  def shrink_crew_matrix!
    matrix = (crew_size_settings || []).map(&:dup)
    return if matrix.empty?

    new_size = EntranceType.count
    return if matrix.size == new_size && matrix.all? { |r| r.size == new_size }

    matrix = matrix.first(new_size)
    matrix.each { |row| row.slice!(new_size, row.size - new_size) if row.size > new_size }
    matrix = [] if new_size.zero?

    update!(crew_size_settings: matrix)
  end

  def crew_size_for(origin_entrance_type, destination_entrance_type)
    return DEFAULT_CREW_VALUE if crew_size_settings.blank?

    o = origin_entrance_type.position
    d = destination_entrance_type.position
    crew_size_settings.dig(o, d) || DEFAULT_CREW_VALUE
  end

  private

  def clear_cache
    Rails.cache.delete(Api::V1::MoveSizesController::CACHE_KEY)
  end

  def should_assign_image_key?
    image.attached? && image.blob&.new_record?
  end

  def assign_custom_image_key
    blob = image.blob
    uuid = SecureRandom.uuid
    ext = blob.filename.extension_with_delimiter
    blob.key = "move_size/#{id || 'temp'}/#{uuid}#{ext}"
  end
end

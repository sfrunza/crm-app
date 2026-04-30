class EntranceType < ApplicationRecord
  # Validations
  validates :name, :form_name, presence: true

  # Callbacks
  normalizes :name, with: ->(n) { n.strip }
  acts_as_list column: :position, top_of_list: 0
  after_create :expand_all_move_sizes!
  around_destroy :destroy_and_compact_positions_and_shrink_matrices
  after_commit :clear_cache

  private

  def clear_cache
    Rails.cache.delete(Api::V1::EntranceTypesController::CACHE_KEY)
  end

  # When you create a new entrance type, expand all MoveSize matrices.
  def expand_all_move_sizes!
    MoveSize.find_each do |ms|
      ms.expand_crew_matrix!
    end
  end

  # Use around_destroy so we only reorder & shrink if destroy succeeds.
  def destroy_and_compact_positions_and_shrink_matrices
    ActiveRecord::Base.transaction do
      yield # performs the actual destroy

      # Reindex remaining entrance types by position (0..n-1) to guarantee contiguous indexes
      EntranceType.order(:position).each_with_index do |et, idx|
        # update_column to avoid validations/callbacks; only change if different
        et.update_column(:position, idx) unless et.position == idx
      end

      # Now shrink all MoveSize matrices (remove last row & column)
      MoveSize.find_each(&:shrink_crew_matrix!)
    end
  end
end

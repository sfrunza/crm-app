class RequestRoom < ApplicationRecord
  belongs_to :request
  belongs_to :room, optional: true

  has_many :request_items, dependent: :destroy

  validates :name, presence: true
end

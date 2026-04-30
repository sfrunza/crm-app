class GlobalSetting < ApplicationRecord
  has_one_attached :company_logo

  validates :singleton_guard, inclusion: { in: [ 0 ] }

  def self.instance
    first_or_create!(singleton_guard: 0)
  end
end

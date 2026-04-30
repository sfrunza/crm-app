class CreateSolidCache < ActiveRecord::Migration[8.1]
  def change
    load Rails.root.join("db/cache_schema.rb")
  end
end

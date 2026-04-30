namespace :parklot do
  desc "Regenerate all parklot slots from existing requests"
  task regenerate_all: :environment do
    count = 0
    Request.find_each do |request|
      ParklotSlotGenerator.call(request)
      count += 1
    end
    puts "Regenerated parklot slots for #{count} requests."
  end
end

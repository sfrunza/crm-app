class RequestInventorySyncService
  def self.call(request)
    new(request).call
  end

  def initialize(request)
    @request = request
  end

  def call
    @request.reload
    @request.refresh_inventory_totals!
    RequestCalculator.call(@request, save: true)
    RequestBroadcastService.call(@request, :update)
  end
end

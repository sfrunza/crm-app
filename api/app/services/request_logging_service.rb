class RequestLoggingService
  def self.call(request, action, tracked_changes = {})
    new(request, action, tracked_changes).call
  end

  def initialize(request, action, tracked_changes)
    @request = request
    @action = action
    @tracked_changes = tracked_changes
  end

  def call
    return unless Current.session

    if action == :create
      log_creation
    else
      log_field_changes
    end
  end

  private

  attr_reader :request, :action, :tracked_changes

  def log_creation
    RequestLog.log!(
      request: request,
      user: Current.user,
      action: "request_created",
      details: { request_id: request.id },
      session: Current.session
    )
  end

  def log_field_changes
    return if tracked_changes.empty?

    tracked = tracked_changes.slice(*RequestLog::TRACKED_FIELDS)
    return if tracked.empty?

    resolver = RequestLogResolver.new

    tracked.each do |field, (old_value, new_value)|
      RequestLog.log!(
        request: request,
        user: Current.user,
        action: "field_updated",
        details: resolver.build_details(field, old_value, new_value),
        session: Current.session
      )
    end
  end
end

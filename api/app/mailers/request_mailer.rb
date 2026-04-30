class RequestMailer < ApplicationMailer
  def status_changed(request)
    @request = request
    mail(to: @request.customer.email_address, subject: "Your Moving Request Status: #{@request.status.humanize}")
  end
end

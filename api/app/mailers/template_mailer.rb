class TemplateMailer < ApplicationMailer
  default from: "no-reply@myapp.com"

  # Sends a pre-built email template to an arbitrary recipient.
  #
  # @param recipient [String] email address
  # @param template  [EmailTemplate] the template record
  # @param request   [Request] the request context (used for variable substitution)
  def send_template(recipient:, template:, request:, extra_variables: {})
    @template = template
    @request  = request
    customer  = request.customer

    if customer
      token = customer.generate_magic_link!(expires_in: 2.days)
      auto_login_url = "#{ENV.fetch("FRONTEND_URL")}/auth/auto-login?token=#{token}&return_to=/account/requests/#{request.id}"
    end

    @variables = {
      first_name:     customer&.first_name || "",
      last_name:      customer&.last_name || "",
      email:          recipient,
      company_name:   Setting.company_name,
      request_id:     request.id,
      auto_login_url: auto_login_url || ""
    }.merge(extra_variables)

    @html = render_template_html(@template.html, @variables)

    mail(to: recipient, subject: @template.subject) do |format|
      format.html { render html: @html.html_safe }
    end
  end

  private

  def render_template_html(html, variables)
    html.gsub(/\{\{(\w+)\}\}/) do |_|
      key = Regexp.last_match(1)
      variables[key.to_sym] || "{{#{key}}}"
    end
  end
end

class UserMailer < ApplicationMailer
  default from: "no-reply@myapp.com"

  # Sends a quote-ready email based on a stored template.
  def quote_ready_email(user:, request:, template:)
    @user = user
    @template = template
    token = @user.generate_magic_link!(expires_in: 2.days)

    @url = "#{ENV.fetch("FRONTEND_URL")}/auth/auto-login?token=#{token}&return_to=/account/requests/#{request.id}"

    @variables = {
      first_name: user.first_name,
      last_name: user.last_name,
      company_name: Setting.company_name,
      request_id: request.id,
      auto_login_url: @url
    }

    @html = render_template(@template.html, @variables)

    mail(to: @user.email_address, subject: @template.subject) do |format|
      format.html { render html: @html.html_safe }
    end
  end


  private

  def render_template(html, variables)
    html.gsub(/\{\{(\w+)\}\}/) do |_|
      key = Regexp.last_match(1)
      variables[key.to_sym] || "{{#{key}}}"
    end
  end
end

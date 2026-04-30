class Api::V1::EmailTemplatesController < ApplicationController
  # allow_unauthenticated_access
  include Pundit::Authorization
  before_action :set_email_template, only: %i[ update destroy ]

  # allow_unauthenticated_access only: %i[render_preview]

  CACHE_KEY = "#{Rails.env}/email_templates_v1"

  # GET /email_templates
  def index
    @email_templates = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh email templates"
      EmailTemplate.order(id: :asc).to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached email templates"
    render json: @email_templates, status: :ok
  end

  # POST /email_templates
  def create
    @email_template = EmailTemplate.new(email_template_params)
    authorize @email_template

    if @email_template.save
      render json: @email_template, status: :created
    else
      render json: @email_template.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /email_templates/1
  def update
    authorize @email_template

    if @email_template.update(email_template_params)
      render json: @email_template
    else
      render json: @email_template.errors, status: :unprocessable_entity
    end
  end

  # DELETE /email_templates/1
  def destroy
    authorize @email_template
    @email_template.destroy!

    head :no_content
  rescue ActiveRecord::RecordNotDestroyed
    render json: @email_template.errors, status: :unprocessable_content
  end


  # POST /email_templates/send_emails
  # Sends selected templates to the given recipients in the context of a request.
  #
  # Params:
  #   recipients:   [Array<String>]  list of email addresses
  #   template_ids: [Array<Integer>] list of email template ids
  #   request_id:   [Integer]        the request to pull context from
  def send_emails
    authorize EmailTemplate, :send_emails?

    recipients   = params.require(:recipients)
    template_ids = params.require(:template_ids)
    request_id   = params.require(:request_id)

    request_record = Request.find(request_id)
    templates      = EmailTemplate.where(id: template_ids)

    templates.each do |template|
      recipients.each do |recipient|
        TemplateMailer.send_template(
          recipient: recipient,
          template:  template,
          request:   request_record
        ).deliver_later

        RequestLog.log!(
          request: request_record,
          user: Current.user,
          action: "email_sent",
          details: {
            template_name: template.name
          },
          session: Current.session,
        )
      end
    end

    render json: { message: "Emails queued for delivery" }, status: :ok
  end

  # def render_preview
  #   request = Request.find(500)
  #   user = User.find_by(email_address: "frunza.sergiu3@gmail.com")
  #   tmplate = EmailTemplate.find(3)
  #   UserMailer.quote_ready_email(
  #     user: user,
  #     request: request,
  #     template: tmplate
  #   ).deliver_later

  #   render json: { user: user, request: request, template: tmplate }, status: :ok
  # end

  private

  def set_email_template
    @email_template = EmailTemplate.find(params[:id])
  end

  def email_template_params
    params.expect(email_template: [ :name, :event_key, :subject, :folder_id, :html, :active, :system, :position, design: {}, variables: {} ])
  end
end

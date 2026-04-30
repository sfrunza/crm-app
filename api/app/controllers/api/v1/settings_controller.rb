class Api::V1::SettingsController < ApplicationController
  include Pundit::Authorization

  allow_unauthenticated_access only: %i[ show ]

  CACHE_VERSION = "v1"
  CACHE_KEY = "company_settings/#{CACHE_VERSION}"

  def show
    # Rails.cache.delete(CACHE_KEY)
    settings_json = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE MISS] company settings"

      global = GlobalSetting.instance

      {
        company_name: Setting.company_name,
        company_address: Setting.company_address,
        company_phone: Setting.company_phone,
        company_email: Setting.company_email,
        company_website: Setting.company_website,
        parking_address: Setting.parking_address,
        parking_location: Setting.parking_location,
        company_logo_url: global.company_logo.attached? ? url_for(global.company_logo) : nil
      }
    end

    render json: settings_json, status: :ok
  end

  def update
    authorize Setting

    global = GlobalSetting.instance

    ActiveRecord::Base.transaction do
      update_text_settings!
      update_logo!(global)
    end

    Rails.cache.delete(CACHE_KEY)

    render json: serialized_settings(global), status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [ e.message ] }, status: :unprocessable_entity
  end

  private

  def update_text_settings!
    params_hash = setting_params.except(:company_logo)

    # Handle parking_location separately since it's a nested object
    if params_hash[:parking_location].present?
      location_hash = params_hash[:parking_location].to_h.deep_symbolize_keys.slice(:lat, :lng)
      # Convert lat and lng to numbers (floats)
      location_hash[:lat] = location_hash[:lat].to_f if location_hash[:lat].present?
      location_hash[:lng] = location_hash[:lng].to_f if location_hash[:lng].present?
      Setting.parking_location = location_hash
    end

    # Handle string fields
    params_hash.except(:parking_location).each do |key, value|
      next if value.nil?

      Setting.public_send("#{key}=", value.strip)
    end
  end

  def update_logo!(global)
    return unless setting_params[:company_logo]

    global.company_logo.attach(setting_params[:company_logo])
  end

  def serialized_settings(global)
    {
      company_name: Setting.company_name,
      company_address: Setting.company_address,
      company_phone: Setting.company_phone,
      company_email: Setting.company_email,
      company_website: Setting.company_website,
      parking_address: Setting.parking_address,
      parking_location: Setting.parking_location,
      company_logo_url: global.company_logo.attached? ? url_for(global.company_logo) : nil
    }
  end

  def setting_params
    params.require(:setting).permit(
      :company_name,
      :company_address,
      :company_phone,
      :company_email,
      :company_website,
      :company_logo,
      :parking_address,
      parking_location: %i[lat lng],
    )
  end
end

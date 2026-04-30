class Api::V1::EmployeesController < ApplicationController
  include Pundit::Authorization
  before_action :set_employee, only: %i[show update]

  CACHE_KEY = "#{Rails.env}/employees_v1"

  def index
    authorize User, :index?

    @employees = Rails.cache.fetch(CACHE_KEY, expires_in: 1.year) do
      Rails.logger.info "[CACHE] MISS: loading fresh employees"
      User
      .where.not(role: :customer)
      .select(:id, :first_name, :last_name, :role, :phone, :email_address, :active, :created_at)
      .order(active: :desc, id: :asc)
      .to_a
    end

    Rails.logger.info "[CACHE] HIT: returning cached employees"
    render json: @employees, each_serializer: EmployeeSerializer, status: :ok
  end

  def show
    authorize @employee
    # render json: @employee.as_json(except: %i[password_digest])
    render json: @employee, serializer: EmployeeSerializer, status: :ok
  end

  def create
    @employee = User.new(employee_params)
    authorize @employee

    if @employee.save
      render json: @employee, status: :created
    else
      render json: @employee.errors, status: :unprocessable_entity
    end
  end

  def update
    authorize @employee

    if @employee.update(employee_params)
      render json: @employee.as_json(except: %i[password_digest])
    else
      render json: @employee.errors, status: :unprocessable_entity
    end
  end

  private

  def set_employee
    @employee = User.find(params[:id])
  end

  def employee_params
    params.expect(
      employee: %i[
        first_name
        last_name
        email_address
        phone
        role
        active
        password
      ]
    )
  end
end

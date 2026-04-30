class PaymentPolicy < ApplicationPolicy
  def index?
    admin_or_manager? || owner? || assigned_foreman?
  end

  def show?
    admin_or_manager? || owner?
  end

  def create?
    admin_or_manager? || owner? || assigned_foreman?
  end

  def confirm?
    admin_or_manager? || owner? || assigned_foreman?
  end

  def refund?
    admin_or_manager?
  end

  private

  def admin_or_manager?
    user.role.in?(%w[admin manager])
  end

  def owner?
    user.role == "customer" && record.is_a?(Payment) && record.request&.customer_id == user.id
  end

  def assigned_foreman?
    user.role == "foreman" && record.is_a?(Payment) && record.request&.foreman_id == user.id
  end
end

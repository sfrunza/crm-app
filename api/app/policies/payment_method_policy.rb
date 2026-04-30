class PaymentMethodPolicy < ApplicationPolicy
  def index?
    admin_or_manager? || owner?
  end

  def create?
    admin_or_manager? || owner?
  end

  def destroy?
    admin_or_manager? || owner?
  end

  private

  def admin_or_manager?
    user.role.in?(%w[admin manager])
  end

  def owner?
    user.role == "customer" && record.is_a?(::PaymentMethod) && record.user_id == user.id
  end
end

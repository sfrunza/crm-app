class PaymentPolicy < ApplicationPolicy
  # Nested request payments use an instance; the admin list uses `authorize Payment`.
  def index?
    if record.is_a?(Class) && record == Payment
      admin_or_manager?
    else
      admin_or_manager? || owner? || assigned_foreman?
    end
  end

  def status_counts?
    true
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

  class Scope < Scope
    def resolve
      case user.role
      when "admin", "manager"
        scope.all
      else
        scope.none
      end
    end
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

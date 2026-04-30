class RequestPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    admin_or_manager? || owner? || assigned_foreman? ||
      assigned_mover_for_confirmed?
  end

  def create?
    true
  end

  def update?
    admin_or_manager? || owner?
  end

  def destroy?
    admin_or_manager?
  end

  def pair?
    admin_or_manager?
  end

  def unpair?
    admin_or_manager?
  end

  def clone?
    admin_or_manager?
  end

  def update_extra_services?
    admin_or_manager?
  end

  def customer_requests?
    admin_or_manager?
  end

  def images?
    admin_or_manager? || owner?
  end

  def delete_image?
    admin_or_manager? || owner?
  end

  def attach_signature?
    admin_or_manager? || owner?
  end

  def status_counts?
    true
  end

  def booking_stats?
    admin_or_manager?
  end

  def calculate?
    admin_or_manager? || owner?
  end

  def calculate_routes?
    admin_or_manager? || owner?
  end

  class Scope < Scope
    def resolve
      case user.role
      when "admin", "manager"
        scope.all
      when "customer"
        scope.where(customer_id: user.id)
      when "foreman"
        scope.where(foreman_id: user.id, status: "confirmed")
      when "driver", "helper"
        scope
          .where(status: "confirmed")
          .joins(:request_movers)
          .where(request_movers: { user_id: user.id })
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
    user.role == "customer" && record.customer_id == user.id
  end

  def assigned_foreman?
    user.role == "foreman" && record.foreman_id == user.id
  end

  def assigned_mover_for_confirmed?
    (user.role == "driver" || user.role == "helper") &&
      record.status == "confirmed" && record.movers.exists?(id: user.id)
  end
end

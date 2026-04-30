class InvoicePolicy < ApplicationPolicy
  # Nested request invoices use an instance; the admin list uses `authorize Invoice`.
  def index?
    if record.is_a?(Class) && record == Invoice
      admin_or_manager?
    else
      admin_or_manager? || owner?
    end
  end

  def create?
    admin_or_manager?
  end

  def void?
    admin_or_manager?
  end

  def send_email?
    admin_or_manager?
  end

  def status_counts?
    true
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
    user.role == "customer" && record.is_a?(Invoice) && record.request&.customer_id == user.id
  end
end

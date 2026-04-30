class UserPolicy < ApplicationPolicy
  def index?
    admin? || manager?
  end

  def create?
    if employee_context?
      admin?
    else # customer context
      admin? || manager? || owner?
    end
  end

  def show?
    admin? || manager? || owner?
  end

  def update?
    if employee_context?
      admin?
    else
      admin? || manager? || owner?
    end
  end

  def find_by_email?
    admin? || manager?
  end

  private

  def admin?
    user.admin?
  end

  def manager?
    user.manager?
  end

  def owner?
    user.role == "customer" && record.id == user.id
  end

  def employee_context?
    record.role.present? && record.role != "customer"
  end
end

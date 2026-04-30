class ItemPolicy < ApplicationPolicy
  def create?
    admin?
  end

  def update?
    admin?
  end

  def destroy?
    admin?
  end

  private

  def admin?
    user.admin?
  end
end

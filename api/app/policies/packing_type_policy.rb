class PackingTypePolicy < ApplicationPolicy
  attr_reader :user, :packing_type

  def initialize(user, packing_type)
    @user = user
    @packing_type = packing_type
  end

  def create?
    user.admin?
  end

  def update?
    user.admin?
  end

  def destroy?
    user.admin?
  end
end

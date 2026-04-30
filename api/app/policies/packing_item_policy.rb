class PackingItemPolicy < ApplicationPolicy
  attr_reader :user, :packing_item

  def initialize(user, packing_item)
    @user = user
    @packing_item = packing_item
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

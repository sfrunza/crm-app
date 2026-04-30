class EntranceTypePolicy < ApplicationPolicy
  attr_reader :user, :entrance_type

  def initialize(user, entrance_type)
    @user = user
    @entrance_type = entrance_type
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

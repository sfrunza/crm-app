class MoveSizePolicy < ApplicationPolicy
  attr_reader :user, :move_size

  def initialize(user, move_size)
    @user = user
    @move_size = move_size
  end

  def create?
    user.admin?
  end

  def update?
    user.admin?
  end

  def bulk_update?
    user.admin?
  end

  def destroy?
    user.admin?
  end
end

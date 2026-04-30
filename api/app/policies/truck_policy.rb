class TruckPolicy < ApplicationPolicy
  attr_reader :user, :truck

  def initialize(user, truck)
    @user = user
    @truck = truck
  end

  def create?
    user.admin?
  end

  def update?
    user.admin?
  end
end

class RatePolicy < ApplicationPolicy
  attr_reader :user, :rate

  def initialize(user, rate)
    @user = user
    @rate = rate
  end

  def create?
    user.admin?
  end

  def update?
    user.admin?
  end
end

class CalendarRatePolicy < ApplicationPolicy
  attr_reader :user, :calendar_rate

  def initialize(user, calendar_rate)
    @user = user
    @calendar_rate = calendar_rate
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

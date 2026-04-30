class ValuationPolicy < ApplicationPolicy
  attr_reader :user, :valuation

  def initialize(user, valuation)
    @user = user
    @valuation = valuation
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

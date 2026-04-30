class RequestLogPolicy < ApplicationPolicy
  def index?
    user.role.in?(%w[admin manager])
  end
end

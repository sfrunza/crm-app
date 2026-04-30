class ConversationPolicy < ApplicationPolicy
  def index?
    user.role.in?(%w[admin manager customer])
  end
end

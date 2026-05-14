# frozen_string_literal: true

class OnlineCustomerPolicy < ApplicationPolicy
  def index?
    user.present? && !user.customer?
  end
end

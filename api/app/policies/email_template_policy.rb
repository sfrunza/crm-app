class EmailTemplatePolicy < ApplicationPolicy
  attr_reader :user, :email_template

  def initialize(user, email_template)
    @user = user
    @email_template = email_template
  end

  def index?
    user.admin? || user.manager?
  end

  def create?
    user.admin? || user.manager?
  end

  def update?
    user.admin? || user.manager?
  end

  def destroy?
    user.admin?
  end

  def send_emails?
    user.admin? || user.manager?
  end
end

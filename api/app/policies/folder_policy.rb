class FolderPolicy < ApplicationPolicy
  attr_reader :user, :folder

  def initialize(user, folder)
    @user = user
    @folder = folder
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

class FolderSerializer < ActiveModel::Serializer
  attributes :id, :name, :position, :is_default, :email_templates_count

  def email_templates_count
    object.email_templates.count
  end
end

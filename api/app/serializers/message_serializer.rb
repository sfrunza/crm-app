class MessageSerializer < ActiveModel::Serializer
  attributes :id,
             :content,
             :request_id,
             :user_id,
             :viewed_by,
             :notified_user_ids,
             :created_at,
             :updated_at

  belongs_to :user, serializer: UserSerializer

  def created_at
    object.created_at.iso8601
  end

  def updated_at
    object.updated_at.iso8601
  end
end



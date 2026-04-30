class RequestLogSerializer < ActiveModel::Serializer
  attributes :id,
             :action,
             :details,
             :ip_address,
             :device_type,
             :browser,
             :platform,
             :user_agent,
             :created_at,
             :user


  # belongs_to :user, serializer: UserSerializer

  def created_at
    object.created_at.iso8601
  end


  def user
    {
      id: object.user.id,
      first_name: object.user.first_name,
      last_name: object.user.last_name,
    }
  end
end

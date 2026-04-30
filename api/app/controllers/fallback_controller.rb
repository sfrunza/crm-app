# SessionsController is responsible for handling user login and logout.
class FallbackController < ActionController::Base
  def index
    render file: "public/index.html"
  end
end

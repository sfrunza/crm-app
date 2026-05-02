Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

  namespace :api do
    namespace :v1 do
      resource :session, only: %i[ create show destroy ] do
        get :auto_login, on: :collection
      end

      resources :passwords, param: :token


      resources :users, only: %i[create show update] do
        get :me, on: :collection
        get :find_by_email, on: :collection
      end

      resource :settings, only: %i[ show update ]
      resources :search, only: %i[ index ]
      resources :services, only: %i[ index create update destroy ]
      resources :folders, only: %i[ index create update destroy ]
      resources :packing_types, only: %i[ index create update destroy ]
      resources :valuations, only: %i[ index create update destroy ]
      resources :packing_items, only: %i[ index create update destroy ]
      resources :trucks, only: %i[ index create update ]
      resources :extra_services, only: %i[ index create update destroy ]
      resources :rates, only: %i[index create update]
      resources :calendar_rates, only: %i[index create update destroy]
      resources :entrance_types, only: %i[index create update destroy]
      resources :employees, only: %i[index show create update]

      resources :rooms
      resources :items
      resources :item_room_categories, only: [ :index, :create, :destroy ]

      resources :move_sizes, only: %i[index create update destroy] do
        resources :move_size_rooms, only: [ :create, :update, :destroy ]
      end

      resource :dispatch, controller: :dispatch, only: %i[show] do
        get :active_dates, on: :collection
      end

      resource :notifications, only: [] do
        get :unread_messages_count, on: :collection
      end

      resources :conversations, only: %i[index]

      resources :email_templates, only: %i[index create update destroy] do
        post :send_emails, on: :collection
      end

      resources :requests do
         resources :request_rooms, only: [ :index, :show, :create, :update, :destroy ] do
          resources :request_items, only: [ :index, :create, :update, :destroy ]
        end

        collection do
          get :status_counts
          get :booking_stats
        end

        member do
          post :unpair
          post :pair
          post :images
          delete "images/:image_id", to: "requests#delete_image", as: :delete_image
          post :attach_signature
          post :clone
          get :customer_requests
          post :calculate
          post :calculate_routes
        end

        resources :messages, controller: "request_messages" do
          member do
            post :mark_as_viewed
          end
          collection do
            post :mark_all_as_viewed
            get :unread_count
          end
        end

        resources :request_logs, only: %i[index]

        resources :payments, controller: "request_payments" do
          member do
            post :confirm
            post :refund
          end
        end
        resources :invoices, controller: "request_invoices" do
          member do
            post :void
            post :send_email
          end
        end
      end

      resources :payment_methods, only: %i[index create destroy]

      resources :invoices, only: %i[index] do
        collection do
          get :status_counts
        end
      end

      # Public invoice endpoints (no auth required)
      get "invoices/:token", to: "public_invoices#show", as: :public_invoice
      post "invoices/:token/pay", to: "public_invoices#pay", as: :pay_invoice

      post "webhooks/stripe", to: "webhooks#stripe"
      get "config/stripe", to: "config#stripe"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end

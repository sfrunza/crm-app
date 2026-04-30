class RequestSerializer < ActiveModel::Serializer
  attributes :id,
             :moving_date,
              :delivery_date_window_start,
              :delivery_date_window_end,
              :schedule_date_window_start,
              :schedule_date_window_end,
              :status,
              :customer_id,
              :foreman_id,
              :service_id,
              :packing_type_id,
              :move_size_id,
              :paired_request_id,
              :paired_request,
              :start_time_window,
              :end_time_window,
              :start_time_window_delivery,
              :end_time_window_delivery,
              :start_time_window_schedule,
              :end_time_window_schedule,
              :is_same_day_delivery,
              :is_delivery_now,
              :is_calculator_enabled,
              :is_moving_from_storage,
              :is_deposit_accepted,
              :rate,
              :travel_time,
              :deposit,
              :min_total_time,
              :extra_services_total,
              :packing_items_total,
              :crew_size,
              :crew_size_delivery,
              :can_edit_request,
              :sales_notes,
              :driver_notes,
              :customer_notes,
              :dispatch_notes,
              :extra_services,
              :packing_items,
              :details,
              :work_time,
              :total_time,
              :transportation,
              :labor_price,
              :grand_total,
              :balance,
              :stops,
              :origin,
              :destination,
              :signed_at,
              :booked_at,
              :created_at,
              :updated_at,
              :customer_signature_url,
              :image_urls,
              :unread_messages_count,
              :truck_ids,
              :mover_ids,
              :pickup_truck_ids,
              :delivery_truck_ids,
              :pickup_mover_ids,
              :delivery_mover_ids,
              :foreman_id_delivery,
              :directions,
              :fuel,
              :discount,
              :valuation,
              :payments_total,
              :move_size_snapshot,
              :selected_suggested_room_ids,
              :totals
  # :inventory


  belongs_to :customer, serializer: UserSerializer
  belongs_to :foreman, serializer: UserSerializer
  belongs_to :delivery_foreman, serializer: UserSerializer
  belongs_to :service
  belongs_to :packing_type
  belongs_to :move_size, serializer: MoveSizeSerializer

  has_many :movers, serializer: UserSerializer
  has_many :trucks
  has_many :request_rooms, serializer: RequestRoomSerializer


  # def inventory
  #   rooms = object.request_rooms.map do |request_room|
  #     {
  #       id: request_room.id,
  #       name: request_room.name,
  #       is_custom: request_room.is_custom,
  #       total_volume: request_room.request_items.sum do |item|
  #         item["volume"].to_f * item["quantity"].to_i
  #       end,
  #       total_weight: request_room.request_items.sum do |item|
  #         item["weight"].to_f * item["quantity"].to_i
  #       end,
  #       total_items: request_room.request_items.sum(&:quantity),
  #       total_boxes: request_room.request_items.count(&:is_box),
  #       items: request_room.request_items.map do |request_item|
  #         {
  #           id: request_item.id,
  #           item_id: request_item.item_id,
  #           name: request_item.name,
  #           volume: request_item.volume,
  #           weight: request_item.weight,
  #           quantity: request_item.quantity,
  #           is_box: request_item.is_box,
  #           is_furniture: request_item.is_furniture,
  #           is_special_handling: request_item.is_special_handling,
  #           is_custom: request_item.is_custom
  #         }
  #       end
  #     }
  #   end

  #   total_items = object.request_items.sum(&:quantity)
  #   total_volume = object.request_items.sum do |item|
  #     item["volume"].to_f * item["quantity"].to_i
  #   end
  #   total_weight = object.request_items.sum do |item|
  #     item["weight"].to_f * item["quantity"].to_i
  #   end
  #   total_boxes = object.request_items.count(&:is_box)
  #   {
  #     rooms: rooms,
  #     total_items: total_items,
  #     total_volume: total_volume,
  #     total_weight: total_weight,
  #     total_boxes: total_boxes
  #   }
  # end
  #
  #
  def totals
    RequestInventoryCalculator.new(object).totals
  end

  def sales_notes
    object.sales_notes&.body&.to_html
  end

  def driver_notes
    object.driver_notes&.body&.to_html
  end

  def customer_notes
    object.customer_notes&.body&.to_html
  end

  def dispatch_notes
    object.dispatch_notes&.body&.to_html
  end

  def customer_signature_url
    return nil unless object.customer_signature.attached?

    Rails.application.routes.url_helpers.url_for(object.customer_signature)
  end

  def image_urls
    if object.images.attached?
      object.images.map do |image|
        {
          id: image.id,
          url: Rails.application.routes.url_helpers.url_for(image),
          thumb: Rails.application.routes.url_helpers.url_for(image.variant(resize_to_limit: [ 300, 300 ]))
        }
      end
    else
      []
    end
  end

  def unread_messages_count
    return 0 unless Current.user

    user_id = Current.user.id
    object.messages
          .where.not(user_id: user_id)
          .where.not("viewed_by @> ?", [ user_id ].to_json)
          .count
  end

  def created_at
    object.created_at&.iso8601
  end

  def updated_at
    object.updated_at&.iso8601
  end

  def moving_date
    object.moving_date&.iso8601
  end

  def delivery_date_window_start
    object.delivery_date_window_start&.iso8601
  end

  def delivery_date_window_end
    object.delivery_date_window_end&.iso8601
  end

  def schedule_date_window_start
    object.schedule_date_window_start&.iso8601
  end

  def schedule_date_window_end
    object.schedule_date_window_end&.iso8601
  end

  def booked_at
    object.booked_at&.iso8601
  end

  def foreman_id_delivery
    object.delivery_foreman_id
  end

  def pickup_truck_ids
    object.pickup_truck_ids
  end

  def delivery_truck_ids
    object.delivery_truck_ids
  end

  def pickup_mover_ids
    object.pickup_mover_ids
  end

  def delivery_mover_ids
    object.delivery_mover_ids
  end
end

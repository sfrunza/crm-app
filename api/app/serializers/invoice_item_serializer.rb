class InvoiceItemSerializer < ActiveModel::Serializer
  attributes :id,
             :description,
             :quantity,
             :unit_price,
             :amount,
             :position
end

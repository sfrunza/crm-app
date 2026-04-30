class RequestSearchSerializer < ActiveModel::Serializer
  attributes :data, :highlighting

  def data
    {
      id: object.id,
      name: customer_full_name,
      email_address: customer&.email_address,
      phone: customer&.phone,
      status: object.status.humanize.titleize
    }
  end

  def highlighting
    highlights = {}
    query = instance_options[:query]

    # Always highlight ID if it matches
    highlights[:id] = highlight_text(object.id.to_s, query) if object.id.to_s.include?(query)

    # Highlight customer fields if customer exists
    return highlights unless customer

    highlight_customer_fields(highlights, query)

    highlights.compact
  end

  private

  def customer
    @customer ||= object.customer
  end

  def customer_full_name
    return nil unless customer
    "#{customer.first_name} #{customer.last_name}".strip
  end

  def highlight_customer_fields(highlights, query)
    query_downcase = query.downcase

    if customer.email_address&.downcase&.include?(query_downcase)
      highlights[:email_address] = highlight_text(customer.email_address, query)
    end

    if customer.phone&.downcase&.include?(query_downcase)
      highlights[:phone] = highlight_text(customer.phone, query)
    end

    if customer_full_name.downcase.include?(query_downcase)
      highlights[:name] = highlight_text(customer_full_name, query)
    end
  end

  def highlight_text(text, query)
    text.to_s.gsub(/(#{Regexp.escape(query)})/i, '<mark>\1</mark>')
  end
end

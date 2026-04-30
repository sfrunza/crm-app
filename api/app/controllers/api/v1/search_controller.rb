class Api::V1::SearchController < ApplicationController
  # GET /search
  def index
    query = params[:query].to_s.strip
    if query.blank?
      return render json: { error: "Query parameter is required" }, status: :unprocessable_entity
    end

    sanitized_query = ActiveRecord::Base.sanitize_sql_like(query)
    id_query = Integer(query, exception: false)

    where_sql, binds = build_search_where(sanitized_query, id_query: id_query)

    requests =
      Request
        .left_joins(:customer)
        .includes(:customer) # serializer touches `object.customer`; avoid N+1
        .select(:id, :status, :customer_id)
        .where(where_sql, **binds)
        .order(Arel.sql(ranking_sql(sanitized_query, id_query: id_query)))
        .limit(20)

    render json: requests, each_serializer: RequestSearchSerializer, query: query
  end

  private

  def build_search_where(sanitized_query, id_query:)
    pattern = "%#{sanitized_query}%"

    tokens = sanitized_query.split(/\s+/).reject(&:blank?)
    t1 = tokens[0]
    t2 = tokens[1]

    clauses = []
    binds = { pattern: pattern, t1: t1 ? "%#{t1}%" : nil, t2: t2 ? "%#{t2}%" : nil, id: id_query }

    # Fast path: integer ID lookup (index-backed, avoids CAST+ILIKE scan).
    clauses << "requests.id = :id" if id_query

    # Trigram-backed partial matches.
    clauses << "users.email_address ILIKE :pattern"
    clauses << "users.phone ILIKE :pattern"
    clauses << "users.first_name ILIKE :pattern"
    clauses << "users.last_name ILIKE :pattern"

    # Full-name search without CONCAT (keeps trigram indexes usable).
    if t1.present? && t2.present?
      clauses << "(users.first_name ILIKE :t1 AND users.last_name ILIKE :t2)"
      clauses << "(users.first_name ILIKE :t2 AND users.last_name ILIKE :t1)"
    end

    [ clauses.join(" OR "), binds.compact ]
  end

  def ranking_sql(query, id_query:)
    pattern = "%#{query}%"

    ActiveRecord::Base.sanitize_sql_array([
      <<~SQL.squish,
        CASE
          WHEN requests.id = ? THEN 0
          WHEN users.email_address ILIKE ? THEN 1
          WHEN users.phone ILIKE ? THEN 2
          WHEN users.first_name ILIKE ? OR users.last_name ILIKE ? THEN 3
          ELSE 4
        END
      SQL
      id_query || -1,
      pattern,
      pattern,
      pattern,
      pattern
    ])
  end
end

export interface RequestLog {
  id: number;
  action: RequestLogAction;
  details: Record<string, unknown>;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  platform: string | null;
  user_agent: string | null;
}

export type RequestLogAction =
  | "request_created"
  | "request_viewed"
  | "field_updated"
  | "message_sent"
  | "email_sent"

export interface RequestLogsPage {
  logs: RequestLog[];
  pagination: {
    total_pages: number;
    current_page: number;
    total_count: number;
  };
}

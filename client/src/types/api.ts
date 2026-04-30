import type { UserRole, RequestStatus, PaymentType, PaymentStatus, InvoiceStatus } from './enums';
import type { Conversation, Message, User } from './models';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    next_page: number | null;
    prev_page: number | null;
  };
}

export interface ApiError {
  error?: string;
  errors?: string[];
}

export interface LoginResponse {
  user?: User;
  error?: string;
}

export interface TokenLoginResponse {
  token: string;
  user_id: number;
}

export interface UsersFilter {
  page?: number;
  per_page?: number;
  role?: UserRole;
  active?: boolean;
  q?: string;
}

export interface RequestsFilter {
  page?: number;
  per_page?: number;
  status?: RequestStatus;
  customer_id?: number;
  moving_date_from?: string;
  moving_date_to?: string;
  service_id?: number;
  query?: string;
}

export interface PaymentsFilter {
  page?: number;
  per_page?: number;
  payment_type?: PaymentType;
  status?: PaymentStatus;
}

export interface InvoicesFilter {
  page?: number;
  per_page?: number;
  status?: InvoiceStatus;
}

export interface CatalogFilter {
  page?: number;
  per_page?: number;
  active?: boolean;
  query?: string;
}

export interface SendEmailsPayload {
  recipients: string[];
  template_ids: number[];
  request_id: number;
}

export interface CableMessageEvent {
  type: string;
  message: Message;
}


export interface ConversationsResponse {
  items: Conversation[];
  meta: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

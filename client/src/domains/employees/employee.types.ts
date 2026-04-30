import type { SessionUser } from "@/types/user";

export interface Employee extends SessionUser {
  phone: string;
  active: boolean;
  created_at: string;
}
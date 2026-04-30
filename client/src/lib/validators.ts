import { z } from 'zod';

export const loginSchema = z.object({
  email_address: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email_address: z.email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP is required'),
  apt: z.string().optional().default(''),
  floor_id: z.number().nullable().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export const userSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email_address: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    role: z.enum(['admin', 'manager', 'foreman', 'driver', 'helper', 'customer']),
    active: z.boolean().optional(),
    password: z.string().min(6).optional().or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
  })
  .refine((d) => !d.password || d.password === d.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

export const requestSchema = z.object({
  status: z
    .enum(['lead', 'quoted', 'booked', 'confirmed', 'dispatched', 'in_progress', 'completed', 'cancelled'])
    .optional(),
  customer_id: z.number().nullable().optional(),
  service_id: z.number().nullable().optional(),
  move_size_id: z.number().nullable().optional(),
  packing_type_id: z.number().nullable().optional(),
  moving_date: z.string().nullable().optional(),
  crew_size: z.number().nullable().optional(),
  rate: z.number().min(0).optional(),
  deposit: z.number().min(0).optional(),
  customer_notes: z.string().optional(),
  sales_notes: z.string().optional(),
  driver_notes: z.string().optional(),
  dispatch_notes: z.string().optional(),
});

export const paymentSchema = z.object({
  payment_type: z.enum(['deposit', 'charge', 'invoice_payment', 'cash', 'check', 'other']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

export const invoiceSchema = z.object({
  status: z
    .enum(['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void'])
    .optional(),
  issued_at: z.string().optional(),
  due_at: z.string().optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  miles_setting: z.number().min(0).optional().default(0),
  code: z.string().optional(),
  active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

export const rateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().optional(),
  extra_mover_rate: z.number().min(0).optional().default(0),
  extra_truck_rate: z.number().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

export const extraServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().nullable().optional(),
  active: z.boolean().optional().default(true),
});

export const truckSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  active: z.boolean().optional().default(true),
});

export const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_address: z.string().optional(),
  company_phone: z.string().optional(),
  company_email: z.email().optional().or(z.literal('')),
  company_website: z.url().optional().or(z.literal('')),
  parking_address: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type RequestInput = z.infer<typeof requestSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type RateInput = z.infer<typeof rateSchema>;
export type ExtraServiceInput = z.infer<typeof extraServiceSchema>;
export type TruckInput = z.infer<typeof truckSchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

import { api } from '@/lib/axios';
import type { EmailTemplate, SendEmailsPayload } from '@/types/index';

const ENDPOINT = '/email_templates';

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createEmailTemplate(emailTemplate: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const res = await api.post(ENDPOINT, { email_template: emailTemplate });
  return res.data;
}

export async function updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { email_template: data });
  return res.data;
}

export async function deleteEmailTemplate(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}

export async function sendEmails(payload: SendEmailsPayload): Promise<{ message: string }> {
  const res = await api.post(`${ENDPOINT}/send_emails`, payload);
  return res.data;
}
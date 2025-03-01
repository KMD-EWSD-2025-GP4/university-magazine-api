import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from './logger';

if (!env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required');
}

const resend = new Resend(env.RESEND_API_KEY);

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailTemplate) => {
  try {
    const data = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
    return { success: false, error };
  }
};

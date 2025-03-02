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

export const newContributionEmailTemplate = (data: {
  title: string;
  newContributionId: string;
  student: {
    name: string;
    email: string;
  };
  marketingCoordinator: {
    name: string;
  };
}): string => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">New Contribution Submitted! 📚</h1>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #3498db; margin-bottom: 15px;">${data.title}</h2>
          
          <p style="color: #7f8c8d; line-height: 1.6;">
            Dear ${data.marketingCoordinator.name}, a new contribution has been submitted by:<br>
            <strong style="color: #2c3e50;">${data.student.name}</strong> (${data.student.email})
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/contributions/${data.newContributionId}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
               View Contribution
            </a>
          </div>
        </div>
        
        <p style="color: #95a5a6; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;
};

export const newCommentEmailTemplate = (data: {
  title: string;
  contributionId: string;
  student: {
    name: string;
    email: string;
  };
  marketingCoordinator: {
    name: string;
  };
}): string => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">New Comment Posted!</h1>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #3498db; margin-bottom: 15px;">${data.title}</h2>
          
          <p style="color: #7f8c8d; line-height: 1.6;">
            Dear ${data.student.name}, a new comment has been posted by:<br>
            <strong style="color: #2c3e50;">${data.marketingCoordinator.name} under your contribution.</strong>
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/contributions/${data.contributionId}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
               View Contribution
            </a>
          </div>
        </div>
        
        <p style="color: #95a5a6; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;
};

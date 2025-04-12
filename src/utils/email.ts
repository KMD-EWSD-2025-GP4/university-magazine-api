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
    logger.info(`Email sent: ${JSON.stringify(data)}`);
    if (data.error) {
      logger.error(`Error sending email: ${data.error}`);
      return { success: false, error: data.error };
    }
    return { success: true, data };
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
    return { success: false, error };
  }
};

export const newContributionEmailTemplate = (data: {
  title: string;
  newContributionId: string;
  createdDate: string;
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
        <h1 style="color: #000B41; text-align: center; margin-bottom: 30px; font-size: 28px;">New Contribution Submitted</h1>

        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
            Dear ${data.marketingCoordinator.name},
          </p>

          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 30px;">
            A new article titled "${data.title}" has been submitted by ${data.student.name} on ${data.createdDate} for your review.
          </p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/contributions/${data.newContributionId}"
               style="display: inline-block; padding: 12px 24px; background-color: #002147; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; width: 100%; text-align: center; box-sizing: border-box;">
               View Submission
            </a>
          </div>
        </div>
      </div>
    `;
};

export const newCommentEmailTemplate = (data: {
  title: string;
  contributionId: string;
  recipient: {
    name: string;
    email: string;
  };
  sender: {
    name: string;
    role: 'student' | 'marketing_coordinator';
  };
}): string => {
  const isFromStudent = data.sender.role === 'student';
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h1 style="color: #000B41; text-align: center; margin-bottom: 30px; font-size: 28px;">New Comment on Article Submission</h1>

        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
            Dear ${data.recipient.name},
          </p>

          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 30px;">
            ${
              isFromStudent
                ? `A new comment has been added by student ${data.sender.name} on the article "${data.title}".`
                : `Your submitted article titled "${data.title}" has received feedback from your Faculty's Marketing Coordinator.`
            }
          </p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/contributions/${data.contributionId}"
               style="display: inline-block; padding: 12px 24px; background-color: #002147; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; width: 100%; text-align: center; box-sizing: border-box;">
               View Submission
            </a>
          </div>
        </div>
      </div>
    `;
};

export const updateContributionStatusEmailTemplate = (data: {
  title: string;
  contributionId: string;
  student: {
    name: string;
    email: string;
  };
  status: 'selected' | 'rejected';
}): string => {
  // conditional text based on status like congrats or sorry
  const isSelected = data.status === 'selected';
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h1 style="color: #000B41; text-align: center; margin-bottom: 30px; font-size: 28px;">Feedback on Your Article Submission</h1>

        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 30px;">
           Dear ${data.student.name}, ${
             isSelected
               ? "congratulations! your contribution has been selected for the faculty's magazine."
               : "sorry, your contribution has been rejected for the faculty's magazine."
           }
          </p>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/contributions/${data.contributionId}"
               style="display: inline-block; padding: 12px 24px; background-color: #002147; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; width: 100%; text-align: center; box-sizing: border-box;">
               View Submission
            </a>
          </div>
        </div>
      </div>
    `;
};

export const newGuestRegistrationEmailTemplate = (data: {
  facultyName: string;
  guestEmail: string;
  marketingCoordinator: {
    name: string;
    email: string;
  };
}): string => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h1 style="color: #000B41; text-align: center; margin-bottom: 30px; font-size: 28px;">New Guest Account Registered</h1>

        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
            Dear ${data.marketingCoordinator.name},
          </p>

          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 30px;">
            A new guest account has been successfully registered for the ${data.facultyName}.<br/>
            Guest email: ${data.guestEmail}
          </p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/d/guest-report"
               style="display: inline-block; padding: 12px 24px; background-color: #002147; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; width: 100%; text-align: center; box-sizing: border-box;">
               View Guest Accounts
            </a>
          </div>
        </div>
      </div>
    `;
};

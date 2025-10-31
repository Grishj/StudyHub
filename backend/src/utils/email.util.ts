import nodemailer from 'nodemailer';
import { config } from '@/config/env';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${config.frontend.url}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #6366F1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested to reset your password for your PSC Study App account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>PSC Study Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} PSC Study App. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(email, 'Password Reset Request', html);
};

export const sendWelcomeEmail = async (
  email: string,
  fullName: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PSC Study App! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${fullName},</p>
            <p>Thank you for joining PSC Study App!</p>
            <p>You're now part of a community dedicated to PSC exam preparation.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>📚 Access categorized study materials</li>
              <li>📝 Practice with past questions</li>
              <li>🧠 Take daily quizzes</li>
              <li>👥 Join study groups</li>
              <li>🤖 Get AI-powered assistance</li>
            </ul>
            <p>Happy learning!</p>
            <p>Best regards,<br>PSC Study Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} PSC Study App. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(email, 'Welcome to PSC Study App!', html);
};
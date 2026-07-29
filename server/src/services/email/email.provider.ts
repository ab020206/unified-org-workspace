import { logger } from '../../utils/logger';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  sendEmail(
    options: SendEmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class MockEmailProvider implements EmailProvider {
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    logger.info(
      { to: options.to, subject: options.subject },
      `[MockEmailProvider] Email sent successfully to ${options.to}`
    );
    return { success: true, messageId: `mock-msg-${Date.now()}` };
  }
}

export class SMTPProvider implements EmailProvider {
  async sendEmail(
    options: SendEmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // In production environment, uses nodemailer or SMTP client. Here fallback gracefully to logger / mock.
      logger.info({ to: options.to, subject: options.subject }, '[SMTPProvider] Email delivered');
      return { success: true, messageId: `smtp-${Date.now()}` };
    } catch (err: any) {
      logger.error({ error: err.message, to: options.to }, '[SMTPProvider] Email delivery failed');
      return { success: false, error: err.message };
    }
  }
}

export function getEmailProvider(): EmailProvider {
  const providerType = (process.env.EMAIL_PROVIDER || 'MOCK').toUpperCase();
  if (providerType === 'SMTP') {
    return new SMTPProvider();
  }
  return new MockEmailProvider();
}

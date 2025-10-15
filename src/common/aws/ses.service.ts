import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';
import { Injectable, BadRequestException } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class SesService {
  private client: SESClient;

  constructor(private readonly logger: LoggerService) {
    this.validateEnvironmentVariables();

    this.client = new SESClient({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
      },
    });
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironmentVariables(): void {
    const requiredEnvVars = [
      'AWS_REGION',
      'AWS_ACCESS_KEY',
      'AWS_SECRET_KEY',
      'FROM_MAIL',
    ];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`,
      );
    }
  }

  /**
   * Validate email address format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return Boolean(emailRegex.test(email));
  }

  /**
   * Validate email template content
   */
  private validateEmailTemplate(template: string): boolean {
    return Boolean(
      template && template.trim().length > 0 && template.length <= 100000,
    );
  }

  /**
   * Validate subject line
   */
  private validateSubject(subject: string): boolean {
    return Boolean(
      subject && subject.trim().length > 0 && subject.length <= 200,
    );
  }

  /**
   * Send email using AWS SES
   */
  public async sendSesMail(
    emailTemplate: string,
    destination: string[],
    subject?: string,
    source?: string,
  ): Promise<any> {
    try {
      // Validate inputs
      if (!this.validateEmailTemplate(emailTemplate)) {
        throw new BadRequestException(
          'Invalid email template. Template must not be empty and must be within 100KB',
        );
      }

      if (!destination || destination.length === 0) {
        throw new BadRequestException(
          'At least one destination email address is required',
        );
      }

      // Validate all destination emails
      const invalidEmails = destination.filter(
        (email) => !this.validateEmail(email),
      );
      if (invalidEmails.length > 0) {
        throw new BadRequestException(
          `Invalid email addresses: ${invalidEmails.join(', ')}`,
        );
      }

      if (subject && !this.validateSubject(subject)) {
        throw new BadRequestException(
          'Invalid subject. Subject must not be empty and must be within 200 characters',
        );
      }

      const senderEmail = source || process.env.FROM_MAIL;
      if (!senderEmail || !this.validateEmail(senderEmail)) {
        throw new BadRequestException('Invalid sender email address');
      }

      // Prepare SES parameters
      const params: SendEmailCommandInput = {
        Destination: {
          ToAddresses: destination,
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: emailTemplate.trim(),
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject || 'Message from KMA',
          },
        },
        Source: `KMA <${senderEmail}>`,
      };

      this.logger.log(
        `Sending email to ${destination.join(', ')} with subject: ${subject || 'Message from KMA'}`,
      );

      // Send email via SES
      const command = new SendEmailCommand(params);
      const response = await this.client.send(command);

      this.logger.log(
        `Email sent successfully to ${destination.join(', ')}. Message ID: ${response.MessageId}`,
      );

      return {
        success: true,
        messageId: response.MessageId,
        recipients: destination,
        subject: subject || 'Message from KMA',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${destination?.join(', ') || 'unknown'}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Check if email address is valid format
   */
  public isValidEmail(email: string): boolean {
    return this.validateEmail(email);
  }
}

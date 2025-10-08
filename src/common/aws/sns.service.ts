import { Injectable, BadRequestException } from '@nestjs/common';
import { SNS, config } from 'aws-sdk';
import { LoggerService } from 'src/logger/logger.service';
import { ErrorHandlerService } from 'src/common/errorHandler/error-handler.service';

@Injectable()
export class SnsService {
  private readonly sns: SNS;

  constructor(
    private readonly logger: LoggerService,
    private readonly errorHandler: ErrorHandlerService,
  ) {
    this.validateEnvironmentVariables();

    config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    this.sns = new SNS();
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironmentVariables(): void {
    const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  /**
   * Validate phone number format - basic phone number validation - should start with + and contain only digits
   */
  private validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return Boolean(phoneRegex.test(phoneNumber));
  }

  /**
   * Validate message content - check if message is not empty and within AWS SNS limits
   */
  private validateMessage(message: string): boolean {
    return Boolean(message && message.trim().length > 0 && message.length <= 1600);
  }

  /**
   * Send SMS message using AWS SNS
   */
  async sendMessage(mobileNo: string, message: string): Promise<any> {
    try {
      if (!this.validatePhoneNumber(mobileNo)) {
        throw new BadRequestException('Invalid phone number format. Must be in international format (e.g., +1234567890)');
      }

      if (!this.validateMessage(message)) {
        throw new BadRequestException('Invalid message. Message must not be empty and must be within 1600 characters');
      }

      // Prepare SNS parameters
      const params = {
        Message: message.trim(),
        PhoneNumber: mobileNo,
      };

      // Send message via SNS
      const result = await this.sns.publish(params).promise();

      this.logger.log(`SMS sent successfully to ${mobileNo}. Message ID: ${result.MessageId}`);

      return {
        success: true,
        messageId: result.MessageId,
        phoneNumber: mobileNo,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Failed to send SMS to ${mobileNo}: ${error.message}`, error.stack);

      // Handle specific AWS errors
      if (error.code === 'InvalidParameter') {
        this.errorHandler.handle(error, 'Invalid phone number or message format      ', {
          mobileNo,
          message
        });
      } else if (error.code === 'OptOutError') {
        this.errorHandler.handle(error, 'Phone number has opted out of SMS messages', {
          mobileNo,
          message
        });
      } else if (error.code === 'ThrottlingException') {
        this.errorHandler.handle(error, 'SMS sending rate limit exceeded. Please try again later', {
          mobileNo,
          message
        });
      } else if (error.code === 'AuthorizationError') {
        this.errorHandler.handle(error, 'AWS credentials are invalid or insufficient permissions', {
          mobileNo,
          message
        });
      }

      this.errorHandler.handle(error, 'Failed to send SMS', {
        mobileNo,
        message
      });
    }
  }

  /**
   * Send OTP message
   */
  async sendOTP(mobileNo: string, otp: string, expiryMinutes: number = 10): Promise<any> {
    const message = `Your KMA verification code is ${otp}. This code will expire in ${expiryMinutes} minutes. Do not share this code with anyone.`;
    
    return this.sendMessage(mobileNo, message);
  }

  /**
   * Send notification message
   */
  async sendNotification(mobileNo: string, title: string, body: string): Promise<any> {
    const message = `${title}: ${body}`;

    return this.sendMessage(mobileNo, message);
  }

  /**
   * Check if phone number is valid format
   */
  isValidPhoneNumber(mobileNo: string): boolean {
    return this.validatePhoneNumber(mobileNo);
  }
}

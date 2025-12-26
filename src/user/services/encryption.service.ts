import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  private readonly ivLength = 16; // 128 bits for GCM

  constructor(private readonly configService: ConfigService) {
    // Get encryption key from environment variable
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    
    if (!encryptionKey) {
      this.logger.warn(
        'ENCRYPTION_KEY not set. Using default key (NOT SECURE FOR PRODUCTION).',
      );
      // Default key for development (32 bytes = 256 bits)
      this.key = crypto.scryptSync('default-key-change-in-production', 'salt', 32);
    } else {
      // Convert hex string to buffer, or use the key directly if it's already 32 bytes
      if (encryptionKey.length === 64) {
        // Hex string (64 chars = 32 bytes)
        this.key = Buffer.from(encryptionKey, 'hex');
      } else {
        // Derive key from string using scrypt
        this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
      }
    }

    if (this.key.length !== 32) {
      throw new Error('Encryption key must be 32 bytes (256 bits) for AES-256');
    }
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Combine iv, authTag, and encrypted data
      // Format: iv:authTag:encryptedData (all in hex)
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }
}


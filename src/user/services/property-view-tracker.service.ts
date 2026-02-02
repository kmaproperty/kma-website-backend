import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { SeenPropertyRepository } from '../repositories/seen-property.repository';
import { SessionRepository } from '../repositories/session.repository';

@Injectable()
export class PropertyViewTrackerService {
  private readonly MAX_FREE_VIEWS = 3;

  constructor(
    private readonly seenPropertyRepository: SeenPropertyRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /**
   * Generate a unique session ID
   */
  private generateSessionId(ip: string, userAgent?: string): string {
    const ua = userAgent || 'unknown';
    const hash = crypto
      .createHash('sha256')
      .update(`${ip}:${ua}:${Date.now()}`)
      .digest('hex');
    return hash.substring(0, 32);
  }

  /**
   * Check if user can view property details
   * Returns { canView: boolean, remainingViews: number, requiresLogin: boolean, sessionId: string }
   */
  async canViewProperty(
    sessionId: string | null,
    ip: string,
    userAgent: string | undefined,
    isAuthenticated: boolean,
    propertyId: string,
  ): Promise<{
    canView: boolean;
    remainingViews: number;
    requiresLogin: boolean;
    sessionId: string;
  }> {
    // Authenticated users have unlimited views
    if (isAuthenticated) {
      return {
        canView: true,
        remainingViews: -1, // -1 indicates unlimited
        requiresLogin: false,
        sessionId: sessionId || '',
      };
    }

    // Generate sessionId if not provided
    const effectiveSessionId =
      sessionId || this.generateSessionId(ip, userAgent);

    // Count unique properties viewed with this sessionId
    const uniquePropertyCount =
      await this.seenPropertyRepository.getUniquePropertyCountBySession(
        effectiveSessionId,
      );

    // Check if this property was already viewed in this session
    const alreadyViewed =
      await this.seenPropertyRepository.findBySessionAndProperty(
        effectiveSessionId,
        propertyId,
      );

    // If already viewed, don't count as new view
    if (alreadyViewed) {
      return {
        canView: true,
        remainingViews: this.MAX_FREE_VIEWS - uniquePropertyCount,
        requiresLogin: false,
        sessionId: effectiveSessionId,
      };
    }

    // Check if user has exceeded limit (for new property)
    if (uniquePropertyCount >= this.MAX_FREE_VIEWS) {
      return {
        canView: false,
        remainingViews: 0,
        requiresLogin: true,
        sessionId: effectiveSessionId,
      };
    }

    // User can view new property, return remaining views after this view
    return {
      canView: true,
      remainingViews: this.MAX_FREE_VIEWS - uniquePropertyCount - 1,
      requiresLogin: false,
      sessionId: effectiveSessionId,
    };
  }

  /**
   * Record a property view for unauthenticated or authenticated user.
   * - Anonymous: records in seen_properties with sessionId (limited to MAX_FREE_VIEWS unique properties).
   * - Logged-in: records in seen_properties with userId (unlimited).
   * Returns the sessionId that should be stored (e.g., in cookie) for anonymous users.
   */
  async recordView(
    sessionId: string | null,
    ip: string,
    userAgent: string | undefined,
    propertyId: string,
    isAuthenticated: boolean = false,
    userId?: string | null,
  ): Promise<string> {
    if (isAuthenticated && userId) {
      await this.seenPropertyRepository.upsertForUser(userId, propertyId);
      return sessionId || '';
    }

    // Generate sessionId if not provided
    const effectiveSessionId =
      sessionId || this.generateSessionId(ip, userAgent);

    await this.seenPropertyRepository.upsertForSession(
      effectiveSessionId,
      propertyId,
    );

    return effectiveSessionId;
  }

  /**
   * Get remaining views for a user
   */
  async getRemainingViews(
    sessionId: string | null,
    isAuthenticated: boolean = false,
  ): Promise<number> {
    if (isAuthenticated) {
      return -1; // Unlimited
    }

    if (!sessionId) {
      return this.MAX_FREE_VIEWS;
    }

    const uniquePropertyCount =
      await this.seenPropertyRepository.getUniquePropertyCountBySession(
        sessionId,
      );

    return Math.max(0, this.MAX_FREE_VIEWS - uniquePropertyCount);
  }

  /**
   * Attach userId to all seen_properties records with matching sessionId.
   * Called when user logs in or registers with a session that has viewed properties.
   */
  async mergeSessionWithUser(
    sessionId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      await this.seenPropertyRepository.attachUserToSession(sessionId, userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all property IDs viewed in a session
   */
  async getSessionPropertyViews(sessionId: string): Promise<string[]> {
    return await this.seenPropertyRepository.getPropertyIdsBySession(sessionId);
  }

  /**
   * Create a new session for anonymous users. UI should call this once and send
   * the returned sessionId in the X-Session-Id header on subsequent requests.
   * Uses random bytes to guarantee uniqueness (no duplicate key on concurrent calls).
   */
  async createSession(
    ip: string,
    userAgent?: string,
  ): Promise<{ sessionId: string }> {
    const sessionId = crypto.randomBytes(16).toString('hex');
    await this.sessionRepository.create({
      sessionId,
      ipAddress: ip || null,
      userAgent: userAgent ?? null,
    });
    return { sessionId };
  }
}

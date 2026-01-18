import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { SessionRepository } from '../repositories/session.repository';
import { SessionPropertyViewRepository } from '../repositories/session-property-view.repository';
import { Session } from '../entities/session.entity';

@Injectable()
export class PropertyViewTrackerService {
  private readonly MAX_FREE_VIEWS = 3;

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly sessionPropertyViewRepository: SessionPropertyViewRepository,
  ) {}

  /**
   * Generate a unique session ID from IP and User-Agent
   * In production, this should ideally come from a cookie set by the frontend
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
   * Get or create a session for unauthenticated user
   */
  private async getOrCreateSession(
    sessionId: string | null,
    ip: string,
    userAgent?: string,
  ): Promise<Session> {
    // If sessionId is provided, try to find existing session
    if (sessionId) {
      const existing = await this.sessionRepository.findBySessionId(sessionId);
      if (existing && !existing.userId) {
        // Only return if not merged with a user
        return existing;
      }
    }

    // Create new session
    const newSessionId = sessionId || this.generateSessionId(ip, userAgent);
    const session = await this.sessionRepository.create({
      sessionId: newSessionId,
      ipAddress: ip,
      userAgent: userAgent || null,
      userId: null,
      mergedAt: null,
    });

    return session;
  }

  /**
   * Check if user can view property details
   * Returns { canView: boolean, remainingViews: number, requiresLogin: boolean, sessionId: string }
   */
  async canViewProperty(
    sessionId: string | null,
    ip: string,
    userAgent?: string,
    isAuthenticated: boolean = false,
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

    // Get or create session
    const session = await this.getOrCreateSession(sessionId, ip, userAgent);

    // Count unique properties viewed in this session
    const uniquePropertyCount =
      await this.sessionPropertyViewRepository.getUniquePropertyCount(
        session.id,
      );

    // Check if user has exceeded limit
    if (uniquePropertyCount >= this.MAX_FREE_VIEWS) {
      return {
        canView: false,
        remainingViews: 0,
        requiresLogin: true,
        sessionId: session.sessionId,
      };
    }

    // User can view, return remaining views
    return {
      canView: true,
      remainingViews: this.MAX_FREE_VIEWS - uniquePropertyCount - 1,
      requiresLogin: false,
      sessionId: session.sessionId,
    };
  }

  /**
   * Record a property view for unauthenticated user
   * Returns the sessionId that should be stored (e.g., in cookie)
   */
  async recordView(
    sessionId: string | null,
    ip: string,
    userAgent: string | undefined,
    propertyId: string,
    isAuthenticated: boolean = false,
  ): Promise<string> {
    // Don't track views for authenticated users
    if (isAuthenticated) {
      return sessionId || '';
    }

    // Get or create session
    const session = await this.getOrCreateSession(sessionId, ip, userAgent);

    // Increment view count (or create new view record)
    await this.sessionPropertyViewRepository.incrementViewCount(
      session.id,
      propertyId,
    );

    return session.sessionId;
  }

  /**
   * Get remaining views for a user
   */
  async getRemainingViews(
    sessionId: string | null,
    ip: string,
    userAgent?: string,
    isAuthenticated: boolean = false,
  ): Promise<number> {
    if (isAuthenticated) {
      return -1; // Unlimited
    }

    if (!sessionId) {
      return this.MAX_FREE_VIEWS;
    }

    const session = await this.sessionRepository.findBySessionId(sessionId);
    if (!session || session.userId) {
      // Session not found or already merged
      return this.MAX_FREE_VIEWS;
    }

    const uniquePropertyCount =
      await this.sessionPropertyViewRepository.getUniquePropertyCount(
        session.id,
      );

    return Math.max(0, this.MAX_FREE_VIEWS - uniquePropertyCount);
  }

  /**
   * Merge session views with user account when user logs in
   * This should be called after successful login/signup
   */
  async mergeSessionWithUser(
    sessionId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const session = await this.sessionRepository.mergeSession(
        sessionId,
        userId,
      );
      return !!session;
    } catch (error) {
      // Session might not exist or already merged - that's okay
      return false;
    }
  }

  /**
   * Get all property IDs viewed in a session (for merging purposes)
   */
  async getSessionPropertyViews(sessionId: string): Promise<string[]> {
    const session = await this.sessionRepository.findBySessionId(sessionId);
    if (!session || session.userId) {
      return [];
    }

    const views = await this.sessionPropertyViewRepository.findBySessionId(
      session.id,
    );
    return views.map((view) => view.propertyId);
  }
}

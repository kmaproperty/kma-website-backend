import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { SearchHistoryRepository } from '../repositories/search-history.repository';

@Injectable()
export class SearchTrackerService {
  constructor(
    private readonly searchHistoryRepository: SearchHistoryRepository,
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
   * Record a search query for authenticated or unauthenticated user
   */
  async recordSearch(
    sessionId: string | null,
    ip: string,
    userAgent: string | undefined,
    searchQuery: string,
    isAuthenticated: boolean,
    userId?: string | null,
    location?: string,
    city?: string,
    priceRange?: string,
    filters?: Record<string, any>,
  ): Promise<string> {
    if (isAuthenticated && userId) {
      await this.searchHistoryRepository.recordForUser(
        userId,
        searchQuery,
        location,
        city,
        priceRange,
        filters,
      );
      return sessionId || '';
    }

    // Generate sessionId if not provided
    const effectiveSessionId =
      sessionId || this.generateSessionId(ip, userAgent);

    await this.searchHistoryRepository.recordForSession(
      effectiveSessionId,
      searchQuery,
      location,
      city,
      priceRange,
      filters,
    );

    return effectiveSessionId;
  }

  /**
   * Get search history for a user or session
   */
  async getSearchHistory(
    sessionId: string | null,
    isAuthenticated: boolean,
    userId: string | null,
    page: number,
    limit: number,
  ): Promise<{ data: any[]; total: number }> {
    if (isAuthenticated && userId) {
      return await this.searchHistoryRepository.findByUser(userId, page, limit);
    }

    if (sessionId) {
      return await this.searchHistoryRepository.findBySession(
        sessionId,
        page,
        limit,
      );
    }

    return { data: [], total: 0 };
  }

  /**
   * Attach userId to all search history records with matching sessionId
   * Called when user logs in or registers with a session
   */
  async mergeSessionWithUser(
    sessionId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      await this.searchHistoryRepository.attachUserToSession(sessionId, userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear search history for a user or session
   */
  async clearSearchHistory(
    sessionId: string | null,
    isAuthenticated: boolean,
    userId: string | null,
  ): Promise<void> {
    if (isAuthenticated && userId) {
      await this.searchHistoryRepository.clearForUser(userId);
    } else if (sessionId) {
      await this.searchHistoryRepository.clearForSession(sessionId);
    }
  }
}

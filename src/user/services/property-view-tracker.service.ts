import { Injectable } from '@nestjs/common';

interface ViewRecord {
  count: number;
  lastReset: number;
  viewedProperties: Set<string>; // Track unique properties viewed
}

@Injectable()
export class PropertyViewTrackerService {
  private readonly MAX_FREE_VIEWS = 3;
  private readonly VIEW_RESET_HOURS = 24; // Reset views after 24 hours
  private viewRecords: Map<string, ViewRecord> = new Map();

  /**
   * Get unique identifier for unauthenticated user
   * Uses IP address + User-Agent as identifier
   */
  private getIdentifier(ip: string, userAgent?: string): string {
    const ua = userAgent || 'unknown';
    return `${ip}:${ua}`;
  }

  /**
   * Check if user can view property details
   * Returns { canView: boolean, remainingViews: number, requiresLogin: boolean }
   */
  canViewProperty(
    ip: string,
    userAgent?: string,
    isAuthenticated: boolean = false,
  ): {
    canView: boolean;
    remainingViews: number;
    requiresLogin: boolean;
  } {
    // Authenticated users have unlimited views
    if (isAuthenticated) {
      return {
        canView: true,
        remainingViews: -1, // -1 indicates unlimited
        requiresLogin: false,
      };
    }

    const identifier = this.getIdentifier(ip, userAgent);
    const record = this.viewRecords.get(identifier);

    // If no record exists, user can view (first view)
    if (!record) {
      return {
        canView: true,
        remainingViews: this.MAX_FREE_VIEWS - 1,
        requiresLogin: false,
      };
    }

    // Check if record has expired (24 hours)
    const now = Date.now();
    const hoursSinceReset =
      (now - record.lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= this.VIEW_RESET_HOURS) {
      // Reset the record
      this.viewRecords.delete(identifier);
      return {
        canView: true,
        remainingViews: this.MAX_FREE_VIEWS - 1,
        requiresLogin: false,
      };
    }

    // Check if user has exceeded limit
    if (record.count >= this.MAX_FREE_VIEWS) {
      return {
        canView: false,
        remainingViews: 0,
        requiresLogin: true,
      };
    }

    // User can view, return remaining views
    return {
      canView: true,
      remainingViews: this.MAX_FREE_VIEWS - record.count - 1,
      requiresLogin: false,
    };
  }

  /**
   * Record a property view for unauthenticated user
   */
  recordView(
    ip: string,
    userAgent: string | undefined,
    propertyId: string,
    isAuthenticated: boolean = false,
  ): void {
    // Don't track views for authenticated users
    if (isAuthenticated) {
      return;
    }

    const identifier = this.getIdentifier(ip, userAgent);
    const record = this.viewRecords.get(identifier);

    if (!record) {
      // Create new record
      this.viewRecords.set(identifier, {
        count: 1,
        lastReset: Date.now(),
        viewedProperties: new Set([propertyId]),
      });
    } else {
      // Check if this property was already viewed
      if (!record.viewedProperties.has(propertyId)) {
        record.count += 1;
        record.viewedProperties.add(propertyId);
      }
      // Update last reset time if needed (for tracking purposes)
      record.lastReset = Date.now();
    }

    // Clean up old records periodically (optional - to prevent memory leak)
    this.cleanupOldRecords();
  }

  /**
   * Get remaining views for a user
   */
  getRemainingViews(
    ip: string,
    userAgent?: string,
    isAuthenticated: boolean = false,
  ): number {
    if (isAuthenticated) {
      return -1; // Unlimited
    }

    const identifier = this.getIdentifier(ip, userAgent);
    const record = this.viewRecords.get(identifier);

    if (!record) {
      return this.MAX_FREE_VIEWS;
    }

    // Check if record has expired
    const now = Date.now();
    const hoursSinceReset =
      (now - record.lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= this.VIEW_RESET_HOURS) {
      return this.MAX_FREE_VIEWS;
    }

    return Math.max(0, this.MAX_FREE_VIEWS - record.count);
  }

  /**
   * Clean up old records (older than 24 hours)
   */
  private cleanupOldRecords(): void {
    const now = Date.now();
    const recordsToDelete: string[] = [];

    for (const [identifier, record] of this.viewRecords.entries()) {
      const hoursSinceReset =
        (now - record.lastReset) / (1000 * 60 * 60);
      if (hoursSinceReset >= this.VIEW_RESET_HOURS) {
        recordsToDelete.push(identifier);
      }
    }

    recordsToDelete.forEach((identifier) => {
      this.viewRecords.delete(identifier);
    });
  }

  /**
   * Reset views for a user (for testing or admin purposes)
   */
  resetViews(ip: string, userAgent?: string): void {
    const identifier = this.getIdentifier(ip, userAgent);
    this.viewRecords.delete(identifier);
  }
}


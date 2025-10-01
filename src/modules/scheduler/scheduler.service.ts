import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SyncService } from '../sync/sync.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isRunning = false;

  constructor(
    private configService: ConfigService,
    private syncService: SyncService,
  ) {}

  /**
   * Scheduled sync job - runs based on configured schedule
   */
  @Cron('*/15 * * * *') // Default: every 15 minutes
  async handleScheduledSync() {
    if (this.isRunning) {
      this.logger.warn('⚠️ Sync is already running, skipping scheduled execution');
      return;
    }

    this.isRunning = true;
    this.logger.log('🔄 Starting scheduled sync...');

    try {
      const result = await this.syncService.syncData();
      
      if (result.success) {
        this.logger.log(`✅ Scheduled sync completed: ${result.stats?.created || 0} created, ${result.stats?.updated || 0} updated`);
      } else {
        this.logger.error(`❌ Scheduled sync failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`❌ Scheduled sync error: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.getNextRunTime(),
    };
  }

  /**
   * Get next scheduled run time
   */
  private getNextRunTime(): string {
    // This is a simplified implementation
    // In production, you might want to use a more sophisticated scheduler
    const now = new Date();
    const nextRun = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
    return nextRun.toISOString();
  }
}

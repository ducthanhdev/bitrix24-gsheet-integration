import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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

  // Scheduled sync job - runs based on configured schedule
  @Cron('*/15 * * * *')
  async handleScheduledSync() {
    if (this.isRunning) {
      this.logger.warn('Sync is already running, skipping scheduled execution');
      return;
    }

    this.isRunning = true;

    try {
      const result = await this.syncService.syncData();
      
      if (result.success) {
        this.logger.log(`Scheduled sync completed: ${result.stats?.created || 0} created, ${result.stats?.updated || 0} updated`);
      } else {
        this.logger.error(`Scheduled sync failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Scheduled sync error: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

}

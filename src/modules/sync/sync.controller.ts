import { Controller, Get, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('start')
  async startSync() {
    try {
      const result = await this.syncService.syncData();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const stats = await this.syncService.getSyncStats();
      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('reset')
  async resetSync() {
    try {
      await this.syncService.resetSyncStatus();
      return { success: true, message: 'Sync status reset successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

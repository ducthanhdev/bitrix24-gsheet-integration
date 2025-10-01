import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [SyncModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}

import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';
import { Bitrix24Module } from '../bitrix24/bitrix24.module';

@Module({
  imports: [GoogleSheetsModule, Bitrix24Module],
  providers: [SyncService],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule {}

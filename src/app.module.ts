import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleSheetsModule } from './modules/google-sheets/google-sheets.module';
import { Bitrix24Module } from './modules/bitrix24/bitrix24.module';
import { SyncModule } from './modules/sync/sync.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    GoogleSheetsModule,
    Bitrix24Module,
    SyncModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Bitrix24Service } from './bitrix24.service';
import { Bitrix24Controller } from './bitrix24.controller';

@Module({
  imports: [HttpModule],
  providers: [Bitrix24Service],
  controllers: [Bitrix24Controller],
  exports: [Bitrix24Service],
})
export class Bitrix24Module {}

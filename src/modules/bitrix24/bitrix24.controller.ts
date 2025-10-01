import { Controller, Get, Post, Body } from '@nestjs/common';
import { Bitrix24Service } from './bitrix24.service';
import type { Bitrix24LeadCreateRequest } from './interfaces/bitrix24-lead-create-request.interface';

@Controller('bitrix24')
export class Bitrix24Controller {
  constructor(private readonly bitrix24Service: Bitrix24Service) {}

  @Get('validate')
  async validateConnection() {
    const isValid = await this.bitrix24Service.validateConnection();
    return { valid: isValid };
  }


  @Post('test-lead')
  async testCreateLead(@Body() leadData: Bitrix24LeadCreateRequest) {
    try {
      const lead = await this.bitrix24Service.createLead(leadData);
      return { success: true, lead };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

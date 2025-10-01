import { Controller, Get, Post, Body } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';

@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  @Get('validate')
  async validateConnection() {
    const isValid = await this.googleSheetsService.validateConnection();
    return { valid: isValid };
  }

  @Get('data')
  async getSheetData() {
    return await this.googleSheetsService.readSheetData();
  }

  @Post('test-read')
  async testRead() {
    try {
      const data = await this.googleSheetsService.readSheetData();
      return {
        success: true,
        rowCount: data.length,
        data: data.slice(0, 5), // Return first 5 rows for testing
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

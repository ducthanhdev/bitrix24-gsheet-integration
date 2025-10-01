import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';
import { GoogleSheetsRow } from './interfaces/google-sheets-row.interface';
import { GoogleSheetsUpdateRequest } from './interfaces/google-sheets-update-request.interface';

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;
  private range: string;
  private headerRow: number;

  constructor(private configService: ConfigService) {
    this.initializeGoogleSheets();
    this.spreadsheetId = this.configService.get<string>('google.sheets.spreadsheetId');
    this.range = this.configService.get<string>('google.sheets.range');
    this.headerRow = this.configService.get<number>('google.sheets.headerRow');
  }

  private async initializeGoogleSheets() {
    try {
      const credentials = this.configService.get('google.credentials');
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.logger.log('Google Sheets API initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Sheets API', error);
      throw error;
    }
  }

  /**
   * Read data from Google Sheets
   */
  async readSheetData(): Promise<GoogleSheetsRow[]> {
    try {
      this.logger.log(`Reading data from sheet ${this.spreadsheetId}, range: ${this.range}`);
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      const values = response.data.values;
      if (!values || values.length === 0) {
        this.logger.warn('No data found in the specified range');
        return [];
      }

      // Skip header row and process data
      const dataRows = values.slice(this.headerRow);
      const headers = values[this.headerRow - 1] || [];

      const rows: GoogleSheetsRow[] = dataRows.map((row, index) => {
        const rowData: GoogleSheetsRow = {
          rowNumber: this.headerRow + index + 1,
          data: {},
          syncStatus: this.getColumnValue(row, headers, 'J') || 'pending',
          leadId: this.getColumnValue(row, headers, 'K') || '',
          lastSync: this.getColumnValue(row, headers, 'L') || '',
          errorMessage: this.getColumnValue(row, headers, 'M') || '',
        };

        // Map data based on headers
        headers.forEach((header, colIndex) => {
          if (header && row[colIndex] !== undefined) {
            rowData.data[header] = row[colIndex];
          }
        });

        return rowData;
      });

      this.logger.log(`Successfully read ${rows.length} rows from Google Sheets`);
      return rows;
    } catch (error) {
      this.logger.error('Failed to read data from Google Sheets', error);
      throw error;
    }
  }

  /**
   * Update specific cells in Google Sheets
   */
  async updateSheetData(updates: GoogleSheetsUpdateRequest[]): Promise<void> {
    try {
      this.logger.log(`Updating ${updates.length} cells in Google Sheets`);

      const batchUpdateRequests = updates.map(update => ({
        range: `${update.sheetName || 'Sheet1'}!${update.cell}`,
        values: [[update.value]],
      }));

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: batchUpdateRequests,
        },
      });

      this.logger.log('Successfully updated Google Sheets');
    } catch (error) {
      this.logger.error('Failed to update Google Sheets', error);
      throw error;
    }
  }

  /**
   * Update sync status for a specific row
   */
  async updateRowSyncStatus(
    rowNumber: number,
    status: string,
    leadId?: string,
    errorMessage?: string,
  ): Promise<void> {
    const updates: GoogleSheetsUpdateRequest[] = [
      {
        cell: `J${rowNumber}`,
        value: status,
      },
      {
        cell: `L${rowNumber}`,
        value: new Date().toISOString(),
      },
    ];

    if (leadId) {
      updates.push({
        cell: `K${rowNumber}`,
        value: leadId,
      });
    }

    if (errorMessage) {
      updates.push({
        cell: `M${rowNumber}`,
        value: errorMessage,
      });
    }

    await this.updateSheetData(updates);
  }

  /**
   * Get column value by column name
   */
  private getColumnValue(row: string[], headers: string[], columnName: string): string {
    const columnIndex = headers.indexOf(columnName);
    return columnIndex >= 0 && row[columnIndex] ? row[columnIndex] : '';
  }

  /**
   * Validate Google Sheets connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      this.logger.log('Google Sheets connection validated successfully');
      return true;
    } catch (error) {
      this.logger.error('Google Sheets connection validation failed', error);
      return false;
    }
  }
}

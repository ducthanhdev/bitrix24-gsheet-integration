import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { Bitrix24Service } from '../bitrix24/bitrix24.service';
import { GoogleSheetsRow } from '../google-sheets/interfaces/google-sheets-row.interface';
import { Bitrix24LeadCreateRequest } from '../bitrix24/interfaces/bitrix24-lead-create-request.interface';
import { Bitrix24LeadUpdateRequest } from '../bitrix24/interfaces/bitrix24-lead-update-request.interface';
import { SyncResult } from './interfaces/sync-result.interface';
import type { SyncStats } from './interfaces/sync-stats.interface';
import * as mappingConfig from '../../config/mapping.json';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private fieldMappings: any;
  private statusColumns: any;
  private statusValues: any;
  private duplicateCheckFields: string[];

  constructor(
    private configService: ConfigService,
    private googleSheetsService: GoogleSheetsService,
    private bitrix24Service: Bitrix24Service,
  ) {
    this.fieldMappings = mappingConfig.fieldMappings;
    this.statusColumns = mappingConfig.statusColumns;
    this.statusValues = mappingConfig.statusValues;
    this.duplicateCheckFields = this.configService.get<string[]>('sync.duplicateCheckFields') || ['email', 'phone'];
  }

  /**
   * Main sync method - processes all rows from Google Sheets
   */
  async syncData(): Promise<SyncResult> {
    const startTime = Date.now();
    const stats: SyncStats = {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      duplicates: 0,
    };

    this.logger.log('🔄 Starting data synchronization...');

    try {
      // Read data from Google Sheets
      const rows = await this.googleSheetsService.readSheetData();
      stats.total = rows.length;

      if (rows.length === 0) {
        this.logger.warn('⚠️ No data found to sync');
        return {
          success: true,
          stats,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };
      }

      // Process each row
      for (const row of rows) {
        try {
          await this.processRow(row, stats);
        } catch (error) {
          this.logger.error(`❌ Error processing row ${row.rowNumber}: ${error.message}`);
          stats.errors++;
          await this.updateRowStatus(row, 'error', undefined, error.message);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(`✅ Sync completed: ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors in ${duration}ms`);

      return {
        success: true,
        stats,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Sync failed:', error.message);
      return {
        success: false,
        error: error.message,
        stats,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Process a single row
   */
  private async processRow(row: GoogleSheetsRow, stats: SyncStats): Promise<void> {
    // Skip if already synced and no changes detected
    if (row.syncStatus === this.statusValues.synced && !this.hasChanges(row)) {
      stats.skipped++;
      return;
    }

    // Skip if marked as error and no changes
    if (row.syncStatus === this.statusValues.error && !this.hasChanges(row)) {
      stats.skipped++;
      return;
    }

    // Map Google Sheets data to Bitrix24 format
    const leadData = this.mapRowToLeadData(row);
    
    if (!leadData) {
      stats.skipped++;
      await this.updateRowStatus(row, 'error', undefined, 'Invalid or missing required data');
      return;
    }

    // Check for duplicates
    const duplicates = await this.findDuplicates(leadData);
    
    if (duplicates.length > 0) {
      // Update existing lead
      const existingLead = duplicates[0];
      await this.bitrix24Service.updateLead(existingLead.ID, leadData);
      await this.updateRowStatus(row, this.statusValues.synced, existingLead.ID);
      stats.updated++;
      this.logger.log(`Updated existing lead ${existingLead.ID} for row ${row.rowNumber}`);
    } else {
      // Create new lead
      const newLead = await this.bitrix24Service.createLead(leadData);
      await this.updateRowStatus(row, this.statusValues.synced, newLead.ID);
      stats.created++;
      this.logger.log(`Created new lead ${newLead.ID} for row ${row.rowNumber}`);
    }
  }

  /**
   * Map Google Sheets row data to Bitrix24 lead format
   */
  private mapRowToLeadData(row: GoogleSheetsRow): Bitrix24LeadCreateRequest | null {
    const leadData: Bitrix24LeadCreateRequest = {
      TITLE: '', // Required field
    };

    for (const [fieldName, mapping] of Object.entries(this.fieldMappings)) {
      const mappingTyped = mapping as any;
      const columnValue = this.getColumnValue(row, mappingTyped.googleSheetColumn);
      
      if (mappingTyped.required && !columnValue) {
        this.logger.warn(`Required field ${fieldName} is missing for row ${row.rowNumber}`);
        return null;
      }

      if (columnValue) {
        const processedValue = this.processFieldValue(columnValue, mappingTyped.type);
        leadData[mappingTyped.bitrix24Field] = processedValue;
      }
    }

    return leadData;
  }

  /**
   * Get column value from row data
   */
  private getColumnValue(row: GoogleSheetsRow, columnName: string): string {
    return row.data[columnName] || '';
  }

  /**
   * Process field value based on type
   */
  private processFieldValue(value: string, type: string): any {
    switch (type) {
      case 'number':
        return parseFloat(value) || 0;
      case 'email':
        return value.toLowerCase().trim();
      case 'phone':
        return this.normalizePhone(value);
      default:
        return value.trim();
    }
  }

  /**
   * Normalize phone number
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Find duplicate leads
   */
  private async findDuplicates(leadData: Bitrix24LeadCreateRequest): Promise<any[]> {
    const duplicates: any[] = [];

    for (const field of this.duplicateCheckFields) {
      const fieldMapping = Object.values(this.fieldMappings).find(
        (mapping: any) => mapping.bitrix24Field === field.toUpperCase()
      );

      if (fieldMapping && (fieldMapping as any).bitrix24Field && leadData[(fieldMapping as any).bitrix24Field as keyof Bitrix24LeadCreateRequest]) {
        const value = leadData[(fieldMapping as any).bitrix24Field as keyof Bitrix24LeadCreateRequest];
        const found = await this.bitrix24Service.findDuplicateLeads(
          field === 'email' ? value as string : undefined,
          field === 'phone' ? value as string : undefined
        );
        
        duplicates.push(...found);
      }
    }

    return duplicates;
  }

  /**
   * Check if row has changes
   */
  private hasChanges(row: GoogleSheetsRow): boolean {
    // Simple implementation - in production, you might want to compare with a hash
    return row.syncStatus === this.statusValues.pending || 
           row.syncStatus === this.statusValues.error;
  }

  /**
   * Update row status in Google Sheets
   */
  private async updateRowStatus(
    row: GoogleSheetsRow,
    status: string,
    leadId?: string,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.googleSheetsService.updateRowSyncStatus(
        row.rowNumber,
        status,
        leadId,
        errorMessage,
      );
    } catch (error) {
      this.logger.error(`Failed to update row ${row.rowNumber} status:`, error);
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<SyncStats> {
    const rows = await this.googleSheetsService.readSheetData();
    
    return {
      total: rows.length,
      created: rows.filter(row => row.syncStatus === this.statusValues.synced && !row.leadId).length,
      updated: rows.filter(row => row.syncStatus === this.statusValues.synced && row.leadId).length,
      skipped: rows.filter(row => row.syncStatus === this.statusValues.pending).length,
      errors: rows.filter(row => row.syncStatus === this.statusValues.error).length,
      duplicates: rows.filter(row => row.syncStatus === this.statusValues.duplicate).length,
    };
  }

  /**
   * Reset sync status for all rows
   */
  async resetSyncStatus(): Promise<void> {
    this.logger.log('Resetting sync status for all rows...');
    
    const rows = await this.googleSheetsService.readSheetData();
    
    for (const row of rows) {
      await this.updateRowStatus(row, this.statusValues.pending);
    }
    
    this.logger.log('Sync status reset completed');
  }
}

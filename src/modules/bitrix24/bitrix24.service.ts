import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Bitrix24Lead } from './interfaces/bitrix24-lead.interface';
import { Bitrix24LeadCreateRequest } from './interfaces/bitrix24-lead-create-request.interface';
import { Bitrix24LeadUpdateRequest } from './interfaces/bitrix24-lead-update-request.interface';
import { Bitrix24ApiResponse } from './interfaces/bitrix24-api-response.interface';

@Injectable()
export class Bitrix24Service {
  private readonly logger = new Logger(Bitrix24Service.name);
  private webhookUrl: string;
  private accessToken: string;
  private domain: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.webhookUrl = this.configService.get<string>('bitrix24.webhookUrl');
    this.accessToken = this.configService.get<string>('bitrix24.accessToken');
    this.domain = this.configService.get<string>('bitrix24.domain');
  }

  /**
   * Create a new lead in Bitrix24
   */
  async createLead(leadData: Bitrix24LeadCreateRequest): Promise<Bitrix24Lead> {
    try {
      this.logger.log(`Creating new lead: ${leadData.TITLE}`);

      const response = await this.makeApiCall('crm.lead.add', {
        fields: leadData,
      });

      if (response.result) {
        this.logger.log(`Lead created successfully with ID: ${response.result}`);
        return {
          ID: response.result,
          TITLE: leadData.TITLE,
          EMAIL: leadData.EMAIL,
          PHONE: leadData.PHONE,
          COMPANY_TITLE: leadData.COMPANY_TITLE,
        };
      } else {
        throw new Error(`Failed to create lead: ${response.error_description || 'Unknown error'}`);
      }
    } catch (error) {
      this.logger.error('Failed to create lead in Bitrix24', error);
      throw error;
    }
  }

  /**
   * Update an existing lead in Bitrix24
   */
  async updateLead(leadId: string, leadData: Bitrix24LeadUpdateRequest): Promise<Bitrix24Lead> {
    try {
      this.logger.log(`Updating lead ID: ${leadId}`);

      const response = await this.makeApiCall('crm.lead.update', {
        id: leadId,
        fields: leadData,
      });

      if (response.result) {
        this.logger.log(`Lead updated successfully: ${leadId}`);
        return await this.getLeadById(leadId);
      } else {
        throw new Error(`Failed to update lead: ${response.error_description || 'Unknown error'}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update lead ${leadId} in Bitrix24`, error);
      throw error;
    }
  }

  /**
   * Get lead by ID
   */
  async getLeadById(leadId: string): Promise<Bitrix24Lead> {
    try {
      const response = await this.makeApiCall('crm.lead.get', {
        id: leadId,
      });

      if (response.result) {
        return response.result;
      } else {
        throw new Error(`Lead not found: ${leadId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to get lead ${leadId} from Bitrix24`, error);
      throw error;
    }
  }

  /**
   * Search for duplicate leads by email or phone
   */
  async findDuplicateLeads(email?: string, phone?: string): Promise<Bitrix24Lead[]> {
    try {
      const filter: any = {};
      
      if (email) {
        filter['EMAIL'] = email;
      }
      
      if (phone) {
        filter['PHONE'] = phone;
      }

      if (Object.keys(filter).length === 0) {
        return [];
      }

      const response = await this.makeApiCall('crm.lead.list', {
        filter,
        select: ['ID', 'TITLE', 'EMAIL', 'PHONE', 'COMPANY_TITLE', 'STATUS_ID', 'ASSIGNED_BY_ID'],
      });

      if (response.result) {
        return response.result;
      } else {
        return [];
      }
    } catch (error) {
      this.logger.error('Failed to search for duplicate leads', error);
      return [];
    }
  }

  /**
   * Batch create multiple leads
   */
  async batchCreateLeads(leadsData: Bitrix24LeadCreateRequest[]): Promise<Bitrix24Lead[]> {
    try {
      this.logger.log(`Batch creating ${leadsData.length} leads`);

      const batchCommands = leadsData.map((leadData, index) => ({
        cmd: `crm.lead.add`,
        params: { fields: leadData },
      }));

      const response = await this.makeApiCall('batch', {
        cmd: batchCommands,
      });

      if (response.result) {
        const results = response.result.cmd.map((result: any, index: number) => ({
          ID: result.result,
          TITLE: leadsData[index].TITLE,
          EMAIL: leadsData[index].EMAIL,
          PHONE: leadsData[index].PHONE,
          COMPANY_TITLE: leadsData[index].COMPANY_TITLE,
        }));

        this.logger.log(`Batch created ${results.length} leads successfully`);
        return results;
      } else {
        throw new Error('Failed to batch create leads');
      }
    } catch (error) {
      this.logger.error('Failed to batch create leads', error);
      throw error;
    }
  }

  /**
   * Validate Bitrix24 connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.makeApiCall('crm.lead.fields');
      return !!response.result;
    } catch (error) {
      this.logger.error('Bitrix24 connection validation failed', error);
      return false;
    }
  }

  /**
   * Get available lead fields
   */
  async getLeadFields(): Promise<any> {
    try {
      const response = await this.makeApiCall('crm.lead.fields');
      return response.result;
    } catch (error) {
      this.logger.error('Failed to get lead fields', error);
      throw error;
    }
  }

  /**
   * Make API call to Bitrix24
   */
  private async makeApiCall(method: string, params: any = {}): Promise<Bitrix24ApiResponse> {
    try {
      const url = `${this.webhookUrl}${method}`;
      const data = {
        ...params,
        auth: this.accessToken,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, data, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`API call failed for method: ${method}`, error);
      throw error;
    }
  }
}

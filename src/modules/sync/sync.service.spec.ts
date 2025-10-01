import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SyncService } from './sync.service';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { Bitrix24Service } from '../bitrix24/bitrix24.service';
import { GoogleSheetsRow } from '../google-sheets/interfaces/google-sheets-row.interface';

describe('SyncService', () => {
  let service: SyncService;
  let googleSheetsService: jest.Mocked<GoogleSheetsService>;
  let bitrix24Service: jest.Mocked<Bitrix24Service>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: GoogleSheetsService,
          useValue: {
            readSheetData: jest.fn(),
            updateRowSyncStatus: jest.fn(),
          },
        },
        {
          provide: Bitrix24Service,
          useValue: {
            createLead: jest.fn(),
            updateLead: jest.fn(),
            findDuplicateLeads: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    googleSheetsService = module.get(GoogleSheetsService);
    bitrix24Service = module.get(Bitrix24Service);
    configService = module.get(ConfigService);

    // Mock configuration
    configService.get.mockImplementation((key: string) => {
      const config = {
        'sync.duplicateCheckFields': ['email', 'phone'],
      };
      return config[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncData', () => {
    it('should process rows successfully', async () => {
      const mockRows: GoogleSheetsRow[] = [
        {
          rowNumber: 2,
          data: {
            A: 'John Doe',
            B: 'john@example.com',
            C: '1234567890',
          },
          syncStatus: 'pending',
          leadId: '',
          lastSync: '',
          errorMessage: '',
        },
      ];

      googleSheetsService.readSheetData.mockResolvedValue(mockRows);
      bitrix24Service.findDuplicateLeads.mockResolvedValue([]);
      bitrix24Service.createLead.mockResolvedValue({
        ID: '123',
        TITLE: 'John Doe',
        EMAIL: 'john@example.com',
        PHONE: '1234567890',
      });

      const result = await service.syncData();

      expect(result.success).toBe(true);
      expect(result.stats?.created).toBe(1);
      expect(bitrix24Service.createLead).toHaveBeenCalledTimes(1);
    });

    it('should handle duplicate leads', async () => {
      const mockRows: GoogleSheetsRow[] = [
        {
          rowNumber: 2,
          data: {
            A: 'John Doe',
            B: 'john@example.com',
            C: '1234567890',
          },
          syncStatus: 'pending',
          leadId: '',
          lastSync: '',
          errorMessage: '',
        },
      ];

      const existingLead = {
        ID: '123',
        TITLE: 'John Doe',
        EMAIL: 'john@example.com',
        PHONE: '1234567890',
      };

      googleSheetsService.readSheetData.mockResolvedValue(mockRows);
      bitrix24Service.findDuplicateLeads.mockResolvedValue([existingLead]);
      bitrix24Service.updateLead.mockResolvedValue(existingLead);

      const result = await service.syncData();

      expect(result.success).toBe(true);
      expect(result.stats?.updated).toBe(1);
      expect(bitrix24Service.updateLead).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      googleSheetsService.readSheetData.mockRejectedValue(new Error('API Error'));

      const result = await service.syncData();

      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });
  });

  describe('getSyncStats', () => {
    it('should return correct statistics', async () => {
      const mockRows: GoogleSheetsRow[] = [
        {
          rowNumber: 2,
          data: {},
          syncStatus: 'Đã đồng bộ',
          leadId: '123',
          lastSync: '2023-01-01T00:00:00Z',
          errorMessage: '',
        },
        {
          rowNumber: 3,
          data: {},
          syncStatus: 'Lỗi',
          leadId: '',
          lastSync: '',
          errorMessage: 'Test error',
        },
      ];

      googleSheetsService.readSheetData.mockResolvedValue(mockRows);

      const stats = await service.getSyncStats();

      expect(stats.total).toBe(2);
      expect(stats.updated).toBe(1);
      expect(stats.errors).toBe(1);
    });
  });
});

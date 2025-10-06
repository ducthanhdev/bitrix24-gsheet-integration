import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from './google-sheets.service';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleSheetsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GoogleSheetsService>(GoogleSheetsService);
    configService = module.get(ConfigService);

    // Mock configuration
    configService.get.mockImplementation((key: string) => {
      const config = {
        'google.sheets.spreadsheetId': 'test-sheet-id',
        'google.sheets.range': 'A:Z',
        'google.sheets.headerRow': 1,
        'google.credentials': {
          type: 'service_account',
          project_id: 'test-project',
          private_key_id: 'test-key-id',
          private_key: 'test-private-key',
          client_email: 'test@test.iam.gserviceaccount.com',
          client_id: 'test-client-id',
        },
      };
      return config[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateConnection', () => {
    it('should return true for valid connection', async () => {
      // Mock Google Sheets API response
      const mockSheets = {
        spreadsheets: {
          get: jest.fn().mockResolvedValue({
            data: {
              properties: { title: 'Test Sheet' }
            }
          })
        }
      };

      // Mock google.sheets method
      jest.spyOn(service as any, 'sheets', 'get').mockReturnValue(mockSheets);

      const result = await service.validateConnection();
      expect(result).toBe(true);
    });

    it('should return false for invalid connection', async () => {
      const mockSheets = {
        spreadsheets: {
          get: jest.fn().mockRejectedValue(new Error('Connection failed'))
        }
      };

      jest.spyOn(service as any, 'sheets', 'get').mockReturnValue(mockSheets);

      const result = await service.validateConnection();
      expect(result).toBe(false);
    });
  });

  describe('readSheetData', () => {
    it('should read and parse sheet data correctly', async () => {
      const mockData = [
        ['Name', 'Email', 'Phone'],
        ['John Doe', 'john@example.com', '1234567890'],
        ['Jane Smith', 'jane@example.com', '0987654321']
      ];

      const mockSheets = {
        spreadsheets: {
          values: {
            get: jest.fn().mockResolvedValue({
              data: { values: mockData }
            })
          }
        }
      };

      jest.spyOn(service as any, 'sheets', 'get').mockReturnValue(mockSheets);

      const result = await service.readSheetData();
      
      expect(result).toHaveLength(2);
      expect(result[0].data).toHaveProperty('Name', 'John Doe');
      expect(result[0].data).toHaveProperty('Email', 'john@example.com');
    });
  });
});

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
    it('should validate connection successfully', async () => {
      // Mock the Google Sheets API response
      const mockSheets = {
        spreadsheets: {
          get: jest.fn().mockResolvedValue({ data: { properties: { title: 'Test Sheet' } } }),
        },
      };

      // Mock the sheets property directly
      (service as any).sheets = mockSheets;

      const result = await service.validateConnection();
      expect(result).toBe(true);
    });

    it('should handle connection errors', async () => {
      const mockSheets = {
        spreadsheets: {
          get: jest.fn().mockRejectedValue(new Error('Connection failed')),
        },
      };

      // Mock the sheets property directly
      (service as any).sheets = mockSheets;

      const result = await service.validateConnection();
      expect(result).toBe(false);
    });
  });
});

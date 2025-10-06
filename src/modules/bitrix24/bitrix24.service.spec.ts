import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Bitrix24Service } from './bitrix24.service';
import { of } from 'rxjs';

describe('Bitrix24Service', () => {
  let service: Bitrix24Service;
  let configService: jest.Mocked<ConfigService>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Bitrix24Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<Bitrix24Service>(Bitrix24Service);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);

    // Mock configuration
    configService.get.mockImplementation((key: string) => {
      const config = {
        'bitrix24.webhookUrl': 'https://test.bitrix24.com/rest/1/test/',
        'bitrix24.accessToken': 'test-token',
        'bitrix24.domain': 'test.bitrix24.com',
        'sync.retryAttempts': 3,
        'sync.retryDelay': 1000,
      };
      return config[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLead', () => {
    it('should create lead successfully', async () => {
      const leadData = {
        TITLE: 'Test Lead',
        EMAIL: 'test@example.com',
        PHONE: '1234567890',
      };

      const mockResponse = {
        data: {
          result: {
            ID: '123',
            TITLE: 'Test Lead',
            EMAIL: 'test@example.com',
            PHONE: '1234567890',
          }
        }
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.createLead(leadData);

      expect(result.ID).toBe('123');
      expect(result.TITLE).toBe('Test Lead');
      expect(httpService.post).toHaveBeenCalledWith(
        'https://test.bitrix24.com/rest/1/test/crm.lead.add',
        expect.objectContaining({
          fields: leadData
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const leadData = {
        TITLE: 'Test Lead',
        EMAIL: 'test@example.com',
      };

      httpService.post.mockImplementation(() => {
        throw new Error('API Error');
      });

      await expect(service.createLead(leadData)).rejects.toThrow('API Error');
    });
  });

  describe('findDuplicateLeads', () => {
    it('should find duplicate leads by email', async () => {
      const searchCriteria = {
        email: 'test@example.com'
      };

      const mockResponse = {
        data: {
          result: [
            {
              ID: '123',
              TITLE: 'Existing Lead',
              EMAIL: 'test@example.com',
            }
          ]
        }
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.findDuplicateLeads(searchCriteria);

      expect(result).toHaveLength(1);
      expect(result[0].ID).toBe('123');
    });
  });
});

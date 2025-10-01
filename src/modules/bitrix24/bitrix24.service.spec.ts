import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { Bitrix24Service } from './bitrix24.service';
import { Bitrix24LeadCreateRequest } from './interfaces/bitrix24-lead-create-request.interface';

describe('Bitrix24Service', () => {
  let service: Bitrix24Service;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Bitrix24Service,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
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

    service = module.get<Bitrix24Service>(Bitrix24Service);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);

    // Mock configuration
    configService.get.mockImplementation((key: string) => {
      const config = {
        'bitrix24.webhookUrl': 'https://test.bitrix24.com/rest/1/test/',
        'bitrix24.accessToken': 'test-token',
        'bitrix24.domain': 'test.bitrix24.com',
      };
      return config[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLead', () => {
    it('should create lead successfully', async () => {
      const leadData: Bitrix24LeadCreateRequest = {
        TITLE: 'Test Lead',
        EMAIL: 'test@example.com',
        PHONE: '1234567890',
      };

      const mockResponse = {
        data: {
          result: '123',
        },
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.createLead(leadData);

      expect(result.ID).toBe('123');
      expect(result.TITLE).toBe('Test Lead');
      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('crm.lead.add'),
        expect.objectContaining({
          fields: leadData,
          auth: 'test-token',
        }),
        expect.any(Object),
      );
    });

    it('should handle API errors', async () => {
      const leadData: Bitrix24LeadCreateRequest = {
        TITLE: 'Test Lead',
        EMAIL: 'test@example.com',
      };

      const mockResponse = {
        data: {
          error: 'Invalid data',
          error_description: 'Required field missing',
        },
      };

      httpService.post.mockReturnValue(of(mockResponse));

      await expect(service.createLead(leadData)).rejects.toThrow('Failed to create lead');
    });
  });

  describe('findDuplicateLeads', () => {
    it('should find duplicate leads by email', async () => {
      const mockResponse = {
        data: {
          result: [
            {
              ID: '123',
              TITLE: 'Existing Lead',
              EMAIL: 'test@example.com',
            },
          ],
        },
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.findDuplicateLeads('test@example.com');

      expect(result).toHaveLength(1);
      expect(result[0].ID).toBe('123');
    });

    it('should find duplicate leads by phone', async () => {
      const mockResponse = {
        data: {
          result: [
            {
              ID: '123',
              TITLE: 'Existing Lead',
              PHONE: '1234567890',
            },
          ],
        },
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.findDuplicateLeads(undefined, '1234567890');

      expect(result).toHaveLength(1);
      expect(result[0].ID).toBe('123');
    });

    it('should return empty array when no duplicates found', async () => {
      const mockResponse = {
        data: {
          result: [],
        },
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.findDuplicateLeads('test@example.com');

      expect(result).toHaveLength(0);
    });
  });

  describe('validateConnection', () => {
    it('should validate connection successfully', async () => {
      const mockResponse = {
        data: {
          result: {
            TITLE: { type: 'string', isRequired: true },
            EMAIL: { type: 'string', isRequired: false },
          },
        },
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.validateConnection();

      expect(result).toBe(true);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        data: {
          error: 'Invalid token',
        },
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.validateConnection();

      expect(result).toBe(false);
    });
  });
});

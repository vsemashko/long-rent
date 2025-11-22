import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInfo', () => {
    it('should return API information', () => {
      const info = service.getInfo();

      expect(info).toHaveProperty('name', 'HomeMore API');
      expect(info).toHaveProperty('version', '0.1.0');
      expect(info).toHaveProperty('status', 'Development');
      expect(info).toHaveProperty('documentation', '/api/docs');
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const health = service.healthCheck();

      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('environment');
      expect(new Date(health.timestamp)).toBeInstanceOf(Date);
      expect(typeof health.uptime).toBe('number');
    });
  });
});

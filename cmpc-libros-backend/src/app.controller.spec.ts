import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return status ok and a timestamp', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should return a valid ISO date string', () => {
      const result = appController.getHealth();
      const date = new Date(result.timestamp);
      expect(date instanceof Date).toBe(true);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should return a recent timestamp', () => {
      const result = appController.getHealth();
      const timestamp = new Date(result.timestamp).getTime();
      const now = Date.now();
      const difference = now - timestamp;
      expect(difference).toBeLessThan(1000); // Menos de 1 segundo de diferencia
    });

    it('should have consistent response structure', () => {
      const result = appController.getHealth();
      expect(Object.keys(result)).toEqual(['status', 'timestamp']);
    });
  });
});

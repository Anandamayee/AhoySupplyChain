import { Test, TestingModule } from '@nestjs/testing';
import { QueueUtilitesService } from './queue-utilites.service';

describe('QueueUtilitesService', () => {
  let service: QueueUtilitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueUtilitesService],
    }).compile();

    service = module.get<QueueUtilitesService>(QueueUtilitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

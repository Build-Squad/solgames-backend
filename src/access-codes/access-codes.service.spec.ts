import { Test, TestingModule } from '@nestjs/testing';
import { AccessCodesService } from './access-codes.service';

describe('AccessCodesService', () => {
  let service: AccessCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessCodesService],
    }).compile();

    service = module.get<AccessCodesService>(AccessCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

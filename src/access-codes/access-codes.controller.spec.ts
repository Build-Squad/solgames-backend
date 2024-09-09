import { Test, TestingModule } from '@nestjs/testing';
import { AccessCodesController } from './access-codes.controller';
import { AccessCodesService } from './access-codes.service';

describe('AccessCodesController', () => {
  let controller: AccessCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessCodesController],
      providers: [AccessCodesService],
    }).compile();

    controller = module.get<AccessCodesController>(AccessCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

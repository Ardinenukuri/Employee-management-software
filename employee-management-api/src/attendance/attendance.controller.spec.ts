import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  const mockService = { clockIn: jest.fn(), clockOut: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [{ provide: AttendanceService, useValue: mockService }],
    }).compile();
    controller = module.get<AttendanceController>(AttendanceController);
  });

  it('should clock in and out', async () => {
    await controller.clockIn({ id: '1' } as any);
    await controller.clockOut({ id: '1' } as any);
    expect(mockService.clockIn).toHaveBeenCalled();
    expect(mockService.clockOut).toHaveBeenCalled();
  });
});
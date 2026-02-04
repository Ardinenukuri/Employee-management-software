import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../database/entities/attendance.entity';
import { MailProducerService } from '../mail/mail.producer.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repo: any;

  beforeEach(async () => {
    repo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: getRepositoryToken(Attendance), useValue: repo },
        {
          provide: MailProducerService,
          useValue: { sendAttendanceConfirmation: jest.fn() },
        },
      ],
    }).compile();
    service = module.get<AttendanceService>(AttendanceService);
  });

  it('clockIn success', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue({});
    expect(await service.clockIn({ id: '1' } as any)).toBeDefined();
  });

  it('clockOut fails if no record', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.clockOut({ id: '1' } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('clockIn should throw ConflictException if already clocked in', async () => {
    repo.findOne.mockResolvedValue({ id: 'existing-record' }); // Simulate record found
    await expect(service.clockIn({ id: '1' } as any)).rejects.toThrow(
      ConflictException,
    );
  });

  it('clockOut success', async () => {
    repo.findOne.mockResolvedValue({ clockInTime: new Date() });
    repo.save.mockResolvedValue({ clockOutTime: new Date() });
    const result = await service.clockOut({ id: '1' } as any);
    expect(result.clockOutTime).toBeDefined();
  });
});

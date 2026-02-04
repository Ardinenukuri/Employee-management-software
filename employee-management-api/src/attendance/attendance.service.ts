// src/attendance/attendance.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../database/entities/attendance.entity';
import { Repository, MoreThan, IsNull } from 'typeorm'; // <-- Import IsNull
import { User } from '../database/entities/user.entity';
import { MailProducerService } from '../mail/mail.producer.service';
import { startOfDay } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private mailProducerService: MailProducerService,
  ) {}

  async clockIn(user: User): Promise<Attendance> {
    const todayStart = startOfDay(new Date());

    const existingRecord = await this.attendanceRepository.findOne({
      where: {
        user: { id: user.id },
        clockInTime: MoreThan(todayStart),
      },
    });

    if (existingRecord) {
      throw new ConflictException('Already clocked in today.');
    }

    const newRecord = this.attendanceRepository.create({
      user,
      clockInTime: new Date(),
    });

    await this.attendanceRepository.save(newRecord);
    await this.mailProducerService.sendAttendanceConfirmation(
      user,
      newRecord.clockInTime,
    );

    return newRecord;
  }

  async clockOut(user: User): Promise<Attendance> {
    const todayStart = startOfDay(new Date());

    const recordToUpdate = await this.attendanceRepository.findOne({
      where: {
        user: { id: user.id },
        clockInTime: MoreThan(todayStart),
        clockOutTime: IsNull(), // <-- Use IsNull() instead of null
      },
    });

    if (!recordToUpdate) {
      throw new NotFoundException('No active clock-in record found for today.');
    }

    recordToUpdate.clockOutTime = new Date();
    return this.attendanceRepository.save(recordToUpdate);
  }
}

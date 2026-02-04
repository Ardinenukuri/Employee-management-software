// src/attendance/attendance.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('clock-in')
  clockIn(@CurrentUser() user: User) {
    return this.attendanceService.clockIn(user);
  }

  @Post('clock-out')
  clockOut(@CurrentUser() user: User) {
    return this.attendanceService.clockOut(user);
  }
}
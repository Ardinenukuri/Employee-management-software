import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../database/entities/attendance.entity';
import { AuthModule } from '../auth/auth.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    AuthModule,
    BullModule.registerQueue({
      name: 'reports-queue',
    }),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}

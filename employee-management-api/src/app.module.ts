// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ReportsModule } from './reports/reports.module';
import { MailModule } from './mail/mail.module';
import { User } from './database/entities/user.entity';
import { Attendance } from './database/entities/attendance.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'), // Provide defaults
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME'), // These should be set, so we let them be potentially undefined to throw an error if missing
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Attendance],
        synchronize: true,
      }),
    }),
    AuthModule,
    EmployeesModule,
    AttendanceModule,
    ReportsModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
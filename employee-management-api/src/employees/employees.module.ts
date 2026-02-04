import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule], // Import AuthModule
  providers: [EmployeesService],
  controllers: [EmployeesController],
})
export class EmployeesModule {}

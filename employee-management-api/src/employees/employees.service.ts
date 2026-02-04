// src/employees/employees.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

import { Repository } from 'typeorm';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'firstName', 'lastName', 'email', 'employeeIdentifier', 'phoneNumber', 'role'] // Explicitly exclude password
    });
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'employeeIdentifier', 'phoneNumber', 'role']
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }
  
  async remove(id: string): Promise<void> {
    // First, find the user to ensure they exist
    const userToRemove = await this.usersRepository.findOneBy({ id });
    if (!userToRemove) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Now, perform the hard delete
    await this.usersRepository.remove(userToRemove);
    // Because of the 'onDelete: CASCADE' setting, all of this user's
    // attendance records will be automatically deleted by the database.
  }


  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Omit<User, 'password' | 'hashPassword'>> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    Object.assign(user, updateEmployeeDto);
    const updatedUser = await this.usersRepository.save(user);

    const { password, ...result } = updatedUser;
    
    // The returned 'result' object now correctly matches the updated return type
    return result;
  }
}
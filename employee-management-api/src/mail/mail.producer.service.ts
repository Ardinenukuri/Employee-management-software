import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull'; 
import type { User } from '../database/entities/user.entity'; 

@Injectable()
export class MailProducerService {
  constructor(@InjectQueue('mail-queue') private queue: Queue) {}

  async sendAttendanceConfirmation(user: User, clockInTime: Date) {
    await this.queue.add('attendance-confirmation', {
      userEmail: user.email,
      userName: user.firstName,
      clockInTime,
    });
  }

  async sendPasswordResetLink(userEmail: string, token: string) {
  
    const resetLink = `http://localhost:3000/api/v1/auth/reset-password?token=${token}`;

    await this.queue.add('password-reset', {
      userEmail,
      resetLink,
    });
  }
}

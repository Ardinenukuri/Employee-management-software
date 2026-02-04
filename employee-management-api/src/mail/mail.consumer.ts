import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull'; // <-- Add 'type' keyword

@Processor('mail-queue')
export class MailConsumer {
  @Process('attendance-confirmation')
  async handleAttendanceConfirmation(job: Job) {
    const { userEmail, userName, clockInTime } = job.data;
    console.log(`--- Sending Email ---`);
    console.log(`To: ${userEmail}`);
    console.log(`Subject: Your Attendance Record`);
    console.log(`Hi ${userName},`);
    console.log(`This is to confirm you clocked in at ${new Date(clockInTime).toLocaleTimeString()}.`);
    console.log(`--- Email Sent ---`);
  };

  @Process('password-reset')
  async handlePasswordReset(job: Job) {
    const { userEmail, resetLink } = job.data;
    console.log(`--- Sending Password Reset Email ---`);
    console.log(`To: ${userEmail}`);
    console.log(`Subject: Reset Your Password`);
    console.log(`Please use the following link to reset your password:`);
    console.log(resetLink);
    console.log(`This link is valid for 10 minutes.`);
    console.log(`--- Email Sent ---`);
  }

}
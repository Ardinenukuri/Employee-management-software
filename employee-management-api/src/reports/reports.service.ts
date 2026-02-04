import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../database/entities/attendance.entity';
import { Between, Repository } from 'typeorm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

// Simple UUID v4 generator without external dependencies
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable()
export class ReportsService {
  private reportStore = new Map<
    string,
    { status: string; buffer?: Buffer; type?: string }
  >();
  constructor(
    @InjectQueue('reports-queue') private reportQueue: Queue,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  // Because we are now using hard delete, we no longer need 'withDeleted' here
  private async getAttendanceData(
    startDate: Date,
    endDate: Date,
    employeeId?: string,
  ) {
    const where: any = {
      date: Between(startDate, endDate),
    };

    if (employeeId) {
      where.user = { id: employeeId };
    }

    return this.attendanceRepository.find({
      where,
      relations: ['user'],
      order: { date: 'ASC' },
    });
  }

  async startReportGeneration(
    type: 'pdf' | 'excel',
    startDate: Date,
    endDate: Date,
  ) {
    const jobId = generateUUID(); // <--- Using built-in UUID generator
    this.reportStore.set(jobId, { status: 'processing' });
    await this.reportQueue.add('generate', { jobId, type, startDate, endDate });
    return { jobId };
  }

  getReportStatus(jobId: string) {
    const report = this.reportStore.get(jobId);
    if (!report) throw new NotFoundException('Job not found');
    return { status: report.status };
  }

  downloadReport(jobId: string) {
    const report = this.reportStore.get(jobId);
    if (!report || report.status !== 'completed')
      throw new NotFoundException('Report not ready');
    return { buffer: report.buffer, type: report.type };
  }

  // This will be called by the Queue Consumer
  async processReportJob(
    jobId: string,
    type: 'pdf' | 'excel',
    start: Date,
    end: Date,
  ) {
    const buffer =
      type === 'pdf'
        ? await this.generatePdfReport(start, end)
        : await this.generateExcelReport(start, end);

    this.reportStore.set(jobId, {
      status: 'completed',
      buffer,
      type:
        type === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  async generatePdfReport(startDate: Date, endDate: Date): Promise<Buffer> {
    const data = await this.getAttendanceData(startDate, endDate);
    const doc = new jsPDF();

    autoTable(doc, {
      // Step 1: Add new headers for the PDF
      head: [
        ['Date', 'Employee', 'Email', 'Identifier', 'Clock In', 'Clock Out'],
      ],
      body: data.map((item) => [
        item.date.toLocaleDateString(),
        // Step 2: Add new data points for the PDF
        // The check for item.user is still good practice in case of rare issues
        item.user ? `${item.user.firstName} ${item.user.lastName}` : 'N/A',
        item.user ? item.user.email : 'N/A',
        item.user ? item.user.employeeIdentifier : 'N/A',
        item.clockInTime.toLocaleTimeString(),
        item.clockOutTime ? item.clockOutTime.toLocaleTimeString() : 'N/A',
      ]),
    });
    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateExcelReport(startDate: Date, endDate: Date): Promise<Buffer> {
    const data = await this.getAttendanceData(startDate, endDate);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Step 1: Add new column definitions for Excel
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Employee', key: 'employee', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Identifier', key: 'identifier', width: 20 },
      { header: 'Clock In', key: 'clockIn', width: 15 },
      { header: 'Clock Out', key: 'clockOut', width: 15 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        date: item.date.toLocaleDateString(),
        // Step 2: Add new data points for each row in Excel
        employee: item.user
          ? `${item.user.firstName} ${item.user.lastName}`
          : 'N/A',
        email: item.user ? item.user.email : 'N/A',
        identifier: item.user ? item.user.employeeIdentifier : 'N/A',
        clockIn: item.clockInTime.toLocaleTimeString(),
        clockOut: item.clockOutTime
          ? item.clockOutTime.toLocaleTimeString()
          : 'N/A',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }
}

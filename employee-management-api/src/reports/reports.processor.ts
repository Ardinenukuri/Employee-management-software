import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { ReportsService } from './reports.service';

@Processor('reports-queue')
export class ReportsProcessor {
  constructor(private reportsService: ReportsService) {}

  @Process('generate')
  async handleGeneration(job: Job) {
    const { jobId, type, startDate, endDate } = job.data;
    await this.reportsService.processReportJob(
      jobId,
      type,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

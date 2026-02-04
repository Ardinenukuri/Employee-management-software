import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../database/entities/attendance.entity';
import { getQueueToken } from '@nestjs/bull';
import { NotFoundException } from '@nestjs/common';

describe('ReportsService', () => {
  let service: ReportsService;
  let repo: any;
  let queue: any;

  beforeEach(async () => {
    repo = { find: jest.fn() };
    queue = { add: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Attendance), useValue: repo },
        { provide: getQueueToken('reports-queue'), useValue: queue },
      ],
    }).compile();
    service = module.get<ReportsService>(ReportsService);
  });

  it('should start report generation and return jobId', async () => {
    const result = await service.startReportGeneration('pdf', new Date(), new Date());
    expect(result.jobId).toBeDefined();
    expect(queue.add).toHaveBeenCalled();
  });

  it('should throw error if status jobId is invalid', async () => {
    await expect(service.getReportStatus('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should return processing status', async () => {
    const { jobId } = await service.startReportGeneration('pdf', new Date(), new Date());
    const result = await service.getReportStatus(jobId);
    expect(result.status).toBe('processing');
  });

  it('should process job and mark as completed', async () => {
    repo.find.mockResolvedValue([]);
    const { jobId } = await service.startReportGeneration('pdf', new Date(), new Date());
    await service.processReportJob(jobId, 'pdf', new Date(), new Date());
    const status = await service.getReportStatus(jobId);
    expect(status.status).toBe('completed');
  });

  it('should throw if downloading unready report', async () => {
    const { jobId } = await service.startReportGeneration('pdf', new Date(), new Date());
    await expect(service.downloadReport(jobId)).rejects.toThrow(NotFoundException);
  });

  it('should download completed report', async () => {
    repo.find.mockResolvedValue([]);
    const { jobId } = await service.startReportGeneration('excel', new Date(), new Date());
    await service.processReportJob(jobId, 'excel', new Date(), new Date());
    const result = await service.downloadReport(jobId);
    expect(result.buffer).toBeDefined();
  });
});
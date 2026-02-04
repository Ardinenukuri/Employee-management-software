import { Test, TestingModule } from '@nestjs/testing';
import { ReportsProcessor } from './reports.processor';
import { ReportsService } from './reports.service';

describe('ReportsProcessor', () => {
  let processor: ReportsProcessor;
  const mockService = { processReportJob: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsProcessor,
        { provide: ReportsService, useValue: mockService },
      ],
    }).compile();
    processor = module.get<ReportsProcessor>(ReportsProcessor);
  });

  it('should call processReportJob when job is received', async () => {
    const job = {
      data: {
        jobId: '1',
        type: 'pdf',
        startDate: new Date(),
        endDate: new Date(),
      },
    };
    await processor.handleGeneration(job as any);
    expect(mockService.processReportJob).toHaveBeenCalled();
  });
});

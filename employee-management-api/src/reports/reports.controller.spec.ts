import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  const mockService = { 
    startReportGeneration: jest.fn(), 
    getReportStatus: jest.fn(), 
    downloadReport: jest.fn() 
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockService }],
    }).compile();
    controller = module.get<ReportsController>(ReportsController);
  });

  it('should call all service endpoints', async () => {
    const res = { set: jest.fn() } as any;
    mockService.downloadReport.mockResolvedValue({ buffer: Buffer.from(''), type: 'pdf' });
    
    await controller.trigger('pdf', new Date(), new Date());
    await controller.status('123');
    await controller.download('123', res);
    
    expect(mockService.startReportGeneration).toHaveBeenCalled();
    expect(mockService.getReportStatus).toHaveBeenCalled();
    expect(mockService.downloadReport).toHaveBeenCalled();
  });
});
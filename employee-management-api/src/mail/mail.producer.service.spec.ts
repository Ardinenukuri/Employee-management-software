import { Test, TestingModule } from '@nestjs/testing';
import { MailProducerService } from './mail.producer.service';
import { getQueueToken } from '@nestjs/bull';

describe('MailProducerService', () => {
  let service: MailProducerService;
  let queue: any;

  beforeEach(async () => {
    queue = { add: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProducerService,
        { provide: getQueueToken('mail-queue'), useValue: queue },
      ],
    }).compile();

    service = module.get<MailProducerService>(MailProducerService);
  });

  it('should add attendance job to queue', async () => {
    await service.sendAttendanceConfirmation(
      { firstName: 'test', email: 'a@a.com' } as any,
      new Date(),
    );
    expect(queue.add).toHaveBeenCalled();
  });

  it('should add password reset job to queue', async () => {
    await service.sendPasswordResetLink('a@a.com', 'token');
    expect(queue.add).toHaveBeenCalledWith(
      'password-reset',
      expect.any(Object),
    );
  });
});

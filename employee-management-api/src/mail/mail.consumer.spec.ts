import { MailConsumer } from './mail.consumer';

describe('MailConsumer', () => {
  let consumer: MailConsumer;

  beforeEach(() => {
    consumer = new MailConsumer();
  });

  it('should process attendance confirmation', async () => {
    const job = { data: { userEmail: 't@t.com', userName: 'Test', clockInTime: new Date() } };
    await expect(consumer.handleAttendanceConfirmation(job as any)).resolves.not.toThrow();
  });

  it('should process password reset', async () => {
    const job = { data: { userEmail: 't@t.com', resetLink: 'http://link' } };
    await expect(consumer.handlePasswordReset(job as any)).resolves.not.toThrow();
  });
});
import { MailConsumer } from './mail.consumer';

describe('MailConsumer', () => {
  let consumer: MailConsumer;

  beforeEach(() => {
    consumer = new MailConsumer();
  });

  it('should process attendance confirmation', () => {
    const job = {
      data: { userEmail: 't@t.com', userName: 'Test', clockInTime: new Date() },
    };
    expect(() =>
      consumer.handleAttendanceConfirmation(job as any),
    ).not.toThrow();
  });

  it('should process password reset', () => {
    const job = { data: { userEmail: 't@t.com', resetLink: 'http://link' } };
    expect(() =>
      consumer.handlePasswordReset(job as any),
    ).not.toThrow();
  });
});

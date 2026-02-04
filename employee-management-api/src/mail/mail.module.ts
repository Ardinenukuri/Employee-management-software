import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { MailProducerService } from './mail.producer.service';
import { MailConsumer } from './mail.consumer';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'mail-queue',
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailProducerService, MailConsumer],
  exports: [MailProducerService],
})
export class MailModule {}
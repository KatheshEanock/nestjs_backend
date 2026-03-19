/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Process, Processor } from '@nestjs/bull';
import { MAIL_QUEUE } from './mail.queue';
import { MailService } from 'src/mail/mail.service';
import type { Job } from 'bull';

@Processor(MAIL_QUEUE)
export class MailProcessor {
  constructor(private mailService: MailService) {}

  @Process('send-product-mail')
  async handleSendProductMail(job: Job) {
    console.log('📨 Processing mail job from queue...', job.id);

    const { adminEmail, product, imagePaths } = job.data;

    await this.mailService.sendProductCreatedMail(
      adminEmail,
      product,
      imagePaths,
    );
    console.log('✅ Mail job done:', job.id);
  }
}

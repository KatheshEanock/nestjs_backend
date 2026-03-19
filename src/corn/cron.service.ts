import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { Product } from 'src/modules/users/schemas/product.schema';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private mailService: MailService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendProductReport() {
    this.logger.log(' Running daily product report cron...');

    const products = await this.productModel.find().lean();
    const totalProducts = products.length;
    await this.mailService.sendProductCreatedMail(
      process.env.MAIL_USER!,
      totalProducts,
      products,
    );
    this.logger.log(`✅ Daily report sent — ${totalProducts} products`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  handleEveryMinute() {
    this.logger.log('⏰ Cron running every minute...');
  }
}

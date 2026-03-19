/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface ProductData {
  name: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  images: string[];
  createdAt: Date;
}

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendProductCreatedMail(
    adminEmail: string,
    product: any,
    imagePaths: ProductData[],
  ) {
    try {
      const attachments = imagePaths.map((filePath, index) => ({
        filename: `product-image-${index + 1}.jpg`,
        path: filePath,
        cid: `product_image_${index}`,
      }));

      const imageTagsHtml = imagePaths
        .map(
          (_, index) =>
            `<img src="cid:product_image_${index}" width="200" style="margin:5px; border-radius:8px;" />`,
        )
        .join('');

      const mailOptions = {
        from: `"Your Store" <${process.env.MAIL_USER}>`,
        to: adminEmail,
        subject: `✅ New Product Added: ${product.name}`,

        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          
          <!-- Header -->
          <div style="background: #4F46E5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Product Added 🎉</h1>
          </div>

          <!-- Body -->
          <div style="padding: 30px;">
            <h2 style="color: #333;">Product Details</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f9f9f9;">
                <td style="padding: 10px; font-weight: bold;">Name</td>
                <td style="padding: 10px;">${product.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Price</td>
                <td style="padding: 10px;">₹${product.price}</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="padding: 10px; font-weight: bold;">Stock</td>
                <td style="padding: 10px;">${product.stock}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">isAvailable</td>
                <td style="padding: 10px;">${product.isAvailable ? 'Yes' : 'Out of stock'}</td>
              </tr>
            </table>

            <!-- Images embedded in email -->
            <h3 style="color: #333; margin-top: 20px;">Product Images</h3>
            <div style="display: flex; flex-wrap: wrap;">
              ${imageTagsHtml}
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f0f0f0; padding: 15px; text-align: center;">
            <p style="color: #999; margin: 0;">This is an automated email from Your Store Admin Panel</p>
          </div>

        </div>
      `,

        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Product email sent to ${adminEmail}`);
    } catch (error) {
      console.error('❌ Mail error:', error);
      throw error;
    }
  }
}

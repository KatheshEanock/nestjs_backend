import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../users/schemas/product.schema';
import { Model } from 'mongoose';
import { ProductDto } from 'src/utils/product.dto';
import mongoose from 'mongoose';
import { FilterProductDto } from 'src/utils/filter-product.dto';
import { join } from 'path';
import { InjectQueue } from '@nestjs/bull';
import { MAIL_QUEUE } from 'src/queue/mail.queue';
import type { Queue } from 'bull';

type UpdateDataType = {
  name?: string;
  price?: number;
  stock?: number;
  isAvailable?: boolean;
  images?: string[];
};

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectQueue(MAIL_QUEUE) private mailQueue: Queue,
  ) {}

  async createProduct(dto: ProductDto, files: Express.Multer.File[]) {
    try {
      const imagePaths = files.map((file) =>
        join(process.cwd(), 'uploads', file.filename),
      );
      const product = new this.productModel({
        name: dto.name,
        price: Number(dto.price),
        stock: Number(dto.stock),
        isAvailable:
          dto.isAvailable === true ||
          (dto.isAvailable as any) === 'true' ||
          (dto.isAvailable as any) === '1',
        images: imagePaths,
      });

      await this.mailQueue.add('send-product-mail', {
        adminEmail: process.env.MAIL_USER!,
        product,
        imagePaths,
      });
      console.log('📥 Mail job added to queue');
      return product.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Somthing went wrong');
    }
  }

  async getAllProduct() {
    const products = await this.productModel.find();
    return products.map((product) => {
      const obj = product.toObject();

      obj.images = obj.images?.map(
        (img: string) => `http://localhost:3000/uploads/${img}`,
      );

      return obj;
    });
  }

  async updateProduct(
    id: string,
    dto: ProductDto,
    files: Express.Multer.File[],
  ) {
    const updateData: UpdateDataType = {
      name: dto.name,
      price: Number(dto.price),
      stock: Number(dto.stock),
      isAvailable:
        dto.isAvailable === true ||
        (dto.isAvailable as any) === 'true' ||
        (dto.isAvailable as any) === '1',
    };

    if (files && files.length > 0) {
      updateData.images = files.map((file) => file.filename);
    }

    return this.productModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteProduct(id: string) {
    const deletedProduct = await this.productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product deleted successfully',
      data: {
        id: deletedProduct._id,
        name: deletedProduct.name,
      },
    };
  }

  async filterProducts(filterDto: FilterProductDto) {
    const { createdAt, isAvailable, maxStock, minStock, name } = filterDto;
    const query: mongoose.QueryFilter<Product> = {};
    if (name && typeof name === 'string') {
      query.name = { $regex: name.trim(), $options: 'i' };
    }
    if (createdAt) {
      const start = new Date(createdAt);
      const end = new Date(createdAt);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable;
    }
    if (minStock !== undefined || maxStock !== undefined) {
      query.stock = {};
      if (minStock !== undefined) query.stock.$gte = minStock;
      if (maxStock !== undefined) query.stock.$lte = maxStock;
    }
    return this.productModel.find(query);
  }
}

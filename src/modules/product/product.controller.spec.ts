import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { Product, ProductSchema } from '../users/schemas/product.schema';
import { getQueueToken } from '@nestjs/bull';

describe('ProductController', () => {
  let productController: ProductController;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGODB_URI!),
        MongooseModule.forFeature([
          { name: Product.name, schema: ProductSchema },
        ]),
      ],
      controllers: [ProductController],
      providers: [
        ProductService,
        {
          provide: getQueueToken('mail-queue'), // ✅ mocks BullQueue_mail-queue
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();
    productController = module.get<ProductController>(ProductController);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be define', () => {
    expect(productController).toBeDefined();
  });

  it('should return all product', async () => {
    const result = await productController.getAllProducts();
    console.log(result, 'return all product');
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

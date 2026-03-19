import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { Role } from 'src/common/enums/role.enum';

describe('UserController', () => {
  let userController: UserController;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

        MongooseModule.forRoot(process.env.MONGODB_URI!),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should return all users', async () => {
    const result = await userController.getUsers();

    console.log('Real DB result:', result);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should signup a new user', async () => {
    const dto = {
      name: 'Test User',
      email: 'testuser@gmail.com',
      password: 'Test@123',
      phone: '123456789',
      confirmPassword: 'Test@123',
      role: Role.USER,
    };
    const result = await userController.signup(dto);
    console.log(result, 'created new user');

    expect(result).toBeDefined();
    expect(result.email).toBe(dto.email);
  });

  it('should signin a exiting user', async () => {
    const payload = {
      email: 'testuser@gmail.com',
      password: 'Test@123',
    };

    const result = await userController.signin(payload);
    console.log('Signin result:', result);

    expect(result).toBeDefined();
    expect(result.access_token).toBeDefined();
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from 'src/utils/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async singup(dto: CreateUserDto) {
    try {
      const { password, confirmPassword, email } = dto;

      if (password !== confirmPassword) {
        throw new BadRequestException('Password do not match');
      }

      const exitingUser = await this.userModel.findOne({ email });

      if (exitingUser) {
        throw new BadRequestException('Email already exist');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new this.userModel({
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || 'user',
      });

      return user.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Singup failed');
    }
  }

  async signin(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Invalid Email');
    }
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      throw new BadRequestException('Invalid Password');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    return {
      message: 'Login successfully',
      access_token: token,
      role: user.role,
    };
  }

  async getAllUsers() {
    const users = await this.userModel
      .find({ role: Role.USER })
      .select('name email');
    return users;
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Role as RoleEnum } from 'src/common/enums/role.enum';
import { Role } from 'src/modules/users/schemas/role.schema';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async onModuleInit() {
    const command = process.env.SEED;

    if (command === 'roles') {
      await this.seedRoles();
    } else if (command === 'users') {
      await this.seedUsers();
    } else {
      await this.seedRoles();
      await this.seedUsers();
    }
  }

  async seedRoles() {
    const roles = [
      { name: RoleEnum.ADMIN, description: 'Administrator with full access' },
      { name: RoleEnum.USER, description: 'Regular user with limited access' },
    ];

    for (const role of roles) {
      const existing = await this.roleModel.findOne({ name: role.name });
      if (existing) {
        console.log(`⏭️  Role already exists: ${role.name}`);
        continue;
      }
      await this.roleModel.create(role);
      console.log(`✅ Role created: ${role.name}`);
    }
  }

  async seedUsers() {
    const users = [
      {
        name: 'Admin',
        email: 'admin@test.com',
        phone: 9999999999,
        password: 'admin123',
        role: RoleEnum.ADMIN,
      },
      {
        name: 'Test User',
        email: 'user@test.com',
        phone: 8888888888,
        password: 'user123',
        role: RoleEnum.USER,
      },
    ];

    for (const userData of users) {
      const existing = await this.userModel.findOne({ email: userData.email });
      if (existing) {
        console.log(`⏭️  User already exists: ${userData.email}`);
        continue;
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await this.userModel.create({ ...userData, password: hashedPassword });
      console.log(`✅ User created: ${userData.email}`);
    }
  }
}

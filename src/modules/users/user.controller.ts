import { Body, Controller, Post, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/utils/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.userService.singup(dto);
  }

  @Post('signin')
  signin(@Body() body: { email: string; password: string }) {
    return this.userService.signin(body.email, body.password);
  }

  @Get()
  getUsers() {
    return this.userService.getAllUsers();
  }
}

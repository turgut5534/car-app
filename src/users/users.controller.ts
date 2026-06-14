import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/generated/prisma/client';
import { Get } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';
import { UserId } from 'src/auth/decorators/current-user.decorator';
import { CheckEmailDto } from '../auth/dto/check-email.dto';
import { AuthResponse } from './dto/return-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@UserId() id: string): Promise<User> {
    return this.userService.getProfile(id);
  }

  @Post()
  async saveUser(@Body() dto: CreateUserDto): Promise<AuthResponse> {
    return this.userService.saveUser(dto);
  }
}

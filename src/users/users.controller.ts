import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/generated/prisma/client';
import { Get } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  async saveUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.saveUser(dto);
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/generated/prisma/client';
import { Get } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';

@Controller('users')
export class UsersController {

    constructor(
        private readonly userService: UsersService,
    ) {}

    @Get('')
    async getUsers(): Promise<User[]> {

        return this.userService.getUsers()
    }

    @Post('')
    async saveAdmin(@Body() dto: CreateUserDto ): Promise<User> {

        return this.userService.saveUser(dto)
    }
} 

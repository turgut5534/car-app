import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './dto/return-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async getProfile(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async saveUser(data: CreateUserDto): Promise<AuthResponse> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 12);

      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        if (!existingUser.isVerified) {
          throw new ConflictException(
            'Email already registered but not verified. Verification email sent again.',
          );
        }
        throw new ConflictException('Email already exists');
      }

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
        },
      });

      const accessToken = await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
      });

      return {
        user,
        accessToken,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('An error occurred');
      }
      throw error;
    }
  }

  async updateProfile(
    id: string,
    dto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
      },
    });

    if (file) {

      if(user.picture) {
        const filePath = join(process.cwd(), 'uploads/users', user.picture);
        try {
          await unlink(filePath);
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
        }
      }

      await this.prisma.user.update({
        where: { id },
        data: {
          picture: file.filename,
        },
      });
    }

    return user;
  }
}

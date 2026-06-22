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

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. create user
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
          },
        });

        // 2. create family (auto for every user)
        const family = await tx.family.create({
          data: {
            name: `${data.email}'s family`,
            ownerId: user.id,
          },
        });

        // 3. create membership (OWNER)
        await tx.familyMember.create({
          data: {
            userId: user.id,
            familyId: family.id,
            role: 'OWNER',
          },
        });

        return user;
      });

      const accessToken = await this.jwt.signAsync({
        sub: result.id,
        email: result.email,
      });

      return {
        user: result,
        accessToken,
      };
    } catch (error: any) {
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
      if (user.picture) {
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

  async updateCurrency(id: string, body: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        currency: body.currency,
      },
    });

    console.log(updatedUser);
    return user;
  }

  async searchUser(email: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === userId) {
      throw new BadRequestException('You cannot search yourself');
    }

    return user;
  }
}

import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/generated/prisma/client';
import { NotFoundError } from 'rxjs';
import { CheckPasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
        // role: user.role
      }),
    };
  }

  async checkEmail(email: string): Promise<boolean> {
    console.log(email);
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    return !!user;
  }

  async getMe(userId: string): Promise<User> {

    const user = await this.prisma.user.findFirst({
      where: { id:userId },
    });

    if(!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async changePassword(dto: CheckPasswordDto, userId: string): Promise<boolean> {

    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if(!user) {
      throw new NotFoundException('User not found')
    }

    const validPassword = await bcrypt.compare(dto.currentPassword, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    }); 
    return true;
  }
}

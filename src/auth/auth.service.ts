import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    console.log('asdssd');
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

    // if (!user.isVerified) {
    //   throw new ForbiddenException('Please verify your account first');
    // }
    return {
      accessToken: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
        // role: user.role
      }),
    };
  }

  async checkEmail(email: string): Promise<boolean> {


        console.log(email)
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    return !!user;
  }
}

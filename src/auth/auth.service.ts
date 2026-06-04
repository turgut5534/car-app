import { PrismaService } from "src/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException, Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt'

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

    // await this.prisma.user.update({
    //   where: { id: user.id },
    //   data: { lastLoginAt: new Date() },
    // });

    return {
      accessToken: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
        // role: user.role
      }),
    };
  }
}
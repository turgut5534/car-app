import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';
import { UserId } from './decorators/current-user.decorator';
import { User } from 'src/generated/prisma/client';
import { CheckPasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async loginAdmin(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('check-email')
  async checkEmail(@Body() dto: CheckEmailDto) {
    const exists = await this.authService.checkEmail(dto.email);

    return {
      exists,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Body() dto: CheckPasswordDto, @UserId() userId: string) {

    return this.authService.changePassword(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@UserId() userId): Promise<User> {
    return this.authService.getMe(userId);
  }
}

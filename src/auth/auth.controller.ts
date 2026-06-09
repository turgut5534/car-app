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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CheckEmailDto } from './dto/check-email.dto';

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
}

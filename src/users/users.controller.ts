import { Body, Controller, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/generated/prisma/client';
import { Get } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';
import { UserId } from 'src/auth/decorators/current-user.decorator';
import { CheckEmailDto } from '../auth/dto/check-email.dto';
import { AuthResponse } from './dto/return-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path/win32';

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

  @Patch()
  @UseGuards(JwtAuthGuard)
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads/users',
          filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extname(file.originalname)}`;
  
            cb(null, uniqueName);
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/webp',
          ];
  
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
              new Error('Only PDF, Word, or image files are allowed'),
              false,
            );
          }
  
          cb(null, true);
        },
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      }),
    )
  async udpateProfile(@UserId() id: string, @Body() dto: UpdateUserDto, @UploadedFile() file?: Express.Multer.File): Promise<User> {
    return this.userService.updateProfile(id, dto, file);
  }

  @Patch('currency')
  @UseGuards(JwtAuthGuard)
  async setCurrency(@UserId() userId: string, @Body() body) {
    return this.userService.updateCurrency(userId, body)
  }
}

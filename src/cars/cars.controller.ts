import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';
import { UserId } from 'src/auth/decorators/current-user.decorator';
import { CreateServiceDto } from './dto/create-service.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/cars',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }

        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  createWithImage(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: string,
    @Body() createCarDto: CreateCarDto,
  ) {
    console.log('asdad');
    return this.carsService.createWithImage(createCarDto, userId, file);
  }

  @Post()
  create(@UserId() userId: string, @Body() createCarDto: CreateCarDto) {
    return this.carsService.create(createCarDto, userId);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.carsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.carsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carsService.update(+id, updateCarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId, @Body() body) {
    return this.carsService.remove(id, userId, body);
  }

  @Post(':id/services')
  saveService(
    @Param('id') id: string,
    @UserId() userId: string,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.carsService.saveService(id, userId, createServiceDto);
  }
}

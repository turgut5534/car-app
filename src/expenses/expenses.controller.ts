import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserId } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/expenses',
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
  create(
    @UserId() userId: string,
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.expensesService.create(userId, createExpenseDto, files);
  }

  @Get()
  findAll(
    @Query('carId') carId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.expensesService.findAll(carId, Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/expenses',
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
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Query('carId') carId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @UserId() userId: string,
  ) {
    return this.expensesService.update(
      id,
      updateExpenseDto,
      carId,
      files,
      userId,
    );
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }

  @Delete(':id/files/:fileId')
  removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.expensesService.removeFile(id, fileId);
  }
}

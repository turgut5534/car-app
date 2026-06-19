import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from 'src/prisma.service';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateExpenseDto,
    files: Express.Multer.File[],
  ) {
    const car = await this.prisma.car.findFirst({
      where: {
        id: dto.carId,
        ownerId: userId,
      },
      include: {
        owner: true,
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (Number(dto.mileage) < car.currentKm) {
      throw new BadRequestException(
        'New mileage must be greater than or equal to current mileage',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      try {
        const newExpense = await tx.expense.create({
          data: {
            ...dto,
            createdById: userId,
            currency: car.owner.currency,
            attachments: {
              create: files.map((file) => ({
                url: file.path,
                fileName: file.filename,
                mimeType: file.mimetype,
              })),
            },
          },
        });

        await tx.car.update({
          where: {
            id: dto.carId,
          },
          data: {
            currentKm: Number(dto.mileage),
          },
        });

        return newExpense;
      } catch (error) {
        console.log(error);
        for (const file of files ?? []) {
          const filePath = join(
            process.cwd(),
            'uploads/expenses/',
            file.filename,
          );
          try {
            await unlink(filePath);
          } catch (err) {
            // ignore delete error
          }
        }
      }
    });
  }

  async findAll(carId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where: {
          carId,
        },
        include: {
          createdBy: {
            select: {
              currency: true,
            },
          },
          car: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.expense.count({
        where: {
          carId,
        },
      }),
    ]);

    return {
      items: expenses,
      page,
      limit,
      total,
      hasMore: skip + expenses.length < total,
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id,
      },
      include: {
        createdBy: true,
        car: {
          include: {
            photos: {
              orderBy: [{ is_cover: 'desc' }, { createdAt: 'asc' }],
            },
          },
        },
        attachments: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(
    id: string,
    dto: UpdateExpenseDto,
    carId: string,
    files: Express.Multer.File[],
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updatedExpense = await tx.expense.update({
        where: { id },
        data: {
          ...dto,
          carId,
          createdById: userId,
        },
      });

      if (files && files.length > 0) {
        await tx.expenseAttachment.createMany({
          data: files.map((file) => ({
            expenseId: id,
            url: file.path,
            fileName: file.filename,
            mimeType: file.mimetype,
          })),
        });
      }

      return updatedExpense;
    });
  }
  async remove(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    await Promise.all(
      expense.attachments.map(async (attachment) => {
        try {
          const filePath = join(
            process.cwd(),
            'uploads/expenses',
            attachment.fileName,
          );

          await unlink(filePath);
        } catch (err) {
          console.log(`Failed to delete file ${attachment.fileName}:`, err);
        }
      }),
    );

    await this.prisma.$transaction([
      this.prisma.expenseAttachment.deleteMany({
        where: { expenseId: id },
      }),
      this.prisma.expense.delete({
        where: { id },
      }),
    ]);

    return { success: true };
  }

  async removeFile(id: string, fileId: string) {
    const attachment = await this.prisma.expenseAttachment.findUnique({
      where: { id: fileId },
    });

    if (!attachment) {
      throw new NotFoundException('File not found');
    }

    try {
      const filePath = join(
        process.cwd(),
        'uploads/expenses',
        attachment.fileName,
      );
      await unlink(filePath);
    } catch (err) {
      console.log('File delete error:', err);
    }

    await this.prisma.expenseAttachment.delete({
      where: { id: fileId },
    });

    return { success: true };
  }
}

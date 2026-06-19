import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createExpenseDto: CreateExpenseDto) {
    return 'This action adds a new expense';
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

  findOne(id: number) {
    return `This action returns a #${id} expense`;
  }

  update(id: number, updateExpenseDto: UpdateExpenseDto) {
    return `This action updates a #${id} expense`;
  }

  remove(id: number) {
    return `This action removes a #${id} expense`;
  }
}

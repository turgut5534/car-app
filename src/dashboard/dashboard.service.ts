import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedCars: {
          include: {
            services: {
              where: {
                serviceDate: {
                  gte: startOfMonth,
                  lt: startOfNextMonth,
                },
              },
              select: {
                amount: true,
              },
            },
            photos: {
              orderBy: [{ is_cover: 'desc' }, { createdAt: 'asc' }],
            },
          },
        },
        reminders: true,
        createdExpenses: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ownedCars = user.ownedCars.map((car) => {
      const thisMonthServiceTotal = car.services.reduce((sum, service) => {
        return sum + Number(service.amount);
      }, 0);

      const { services, ...carWithoutServices } = car;

      return {
        ...carWithoutServices,
        thisMonthServiceTotal,
      };
    });

    const { password, ...safeUser } = user;

    return {
      ...safeUser,
      ownedCars,
    };
  }
}

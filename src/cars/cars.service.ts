import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { PrismaService } from 'src/prisma.service';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  //Find all cars
  async findAll(userId: string) {
    const cars = await this.prisma.car.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        owner: true,
        documents: true,
        photos: {
          orderBy: [{ is_cover: 'desc' }, { createdAt: 'asc' }],
        },
        fuels: {
          orderBy: {
            fuelDate: 'desc',
          },
          take: 1,
          select: {
            id: true,
            pricePerLiter: true,
            fuelDate: true,
            liters: true,
            totalAmount: true,
            km: true,
          },
        },
      },
    });

    return cars.map((car) => ({
      ...car,
      lastFuelPricePerLiter: car.fuels[0]?.pricePerLiter ?? null,
      lastFuel: car.fuels[0] ?? null,
    }));
  }

  //Find a car
  async findOne(carId: string, userId: string) {
    const car = await this.prisma.car.findFirst({
      where: {
        id: carId,
        ownerId: userId,
      },
      include: {
        photos: {
          orderBy: [{ is_cover: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!car) return null;

    return car;
  }

  async remove(carId: string, userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const car = await this.prisma.car.findFirst({
      where: {
        id: carId,
        ownerId: userId,
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    await this.prisma.car.delete({
      where: {
        id: carId,
      },
    });

    if (car.imageUrl) {
      const imagePath = join(process.cwd(), 'uploads', 'cars', car.imageUrl);

      await unlink(imagePath).catch(() => null);
    }

    return car;
  }

  async create(dto: CreateCarDto, userId: string, file?: any) {
    try {
      return await this.prisma.car.create({
        data: {
          ...dto,
          ownerId: userId,
          photos: file
            ? {
                create: {
                  url: file.path,
                  is_cover: true,
                  fileName: file.filename,
                  mimeType: file.mimetype,
                },
              }
            : undefined,
        },
      });
    } catch (error) {
      if (file) {
        await unlink(file.path).catch(() => null);
      }

      throw error;
    }
  }

  async update(dto: UpdateCarDto, carId: string, userId: string, file) {
    const car = this.prisma.car.findFirst({
      where: {
        id: carId,
      },
    });

    if (!car) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedCar = await tx.car.update({
        where: { id: carId },
        data: {
          ...dto,
        },
      });

      if (file) {
        await tx.carPhotos.create({
          data: {
            carId: carId,
            url: file.filename,
            fileName: file.filename,
            mimeType: file.mimetype,
          },
        });
      }

      return tx.car.findUnique({
        where: { id: carId },
        include: {
          photos: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    });
  }

  async removePhoto(id: string, userId: string) {
    const photo = await this.prisma.carPhotos.findUnique({
      where: { id },
      include: {
        car: true,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.car.ownerId !== userId) {
      throw new ForbiddenException('You cannot delete this photo');
    }

    if (photo.is_cover) {
      throw new ForbiddenException('You need to set a cover photo first');
    }

    const filePath = `./uploads/cars/${photo.fileName}`;

    await unlink(filePath).catch(() => null);

    await this.prisma.carPhotos.delete({
      where: { id },
    });
  }

  async setCoverPhoto(id: string, carId: string, userId: string) {
    const photo = await this.prisma.carPhotos.findUnique({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.carId !== carId) {
      throw new ForbiddenException('You cannot update this photo');
    }

    if (photo.is_cover) {
      throw new BadRequestException('This photo is already your cover photo');
    }

    await this.prisma.$transaction([
      this.prisma.carPhotos.updateMany({
        where: {
          carId,
          is_cover: true,
        },
        data: {
          is_cover: false,
        },
      }),
      this.prisma.carPhotos.update({
        where: { id },
        data: { is_cover: true },
      }),
    ]);
  }

  async overviewData(userId: string, carId: string) {

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [services, fuels, expenses] = await Promise.all([
      this.prisma.serviceRecord.findMany({
        where: { carId: carId },
      }),

      this.prisma.fuelRecord.findMany({
        where: { carId: carId },
      }),

      this.prisma.expense.findMany({
        where: { carId: carId },
      }),
    ]);

    const history = [
      ...services.map((s) => ({
        id: s.id,
        type: 'SERVICE',
        title: s.title,
        description: s.description,
        mileage: s.km,
        amount: s.amount,
        date: s.serviceDate,
        currency: user.currency,
      })),

      ...fuels.map((f) => ({
        id: f.id,
        type: 'FUEL',
        title: 'Refuel',
        description: `${f.liters} L`,
        mileage: f.km,
        amount: f.totalAmount,
        date: f.fuelDate,
        currency: user.currency,
      })),

      ...expenses.map((e) => ({
        id: e.id,
        type: 'EXPENSE',
        title: e.title,
        description: e.description,
        mileage: e.mileage,
        amount: e.amount,
        date: e.expenseDate,
        currency: user.currency,
      })),
    ];

    return history.sort((a, b) => (b.mileage ?? 0) - (a.mileage ?? 0));
  }
}

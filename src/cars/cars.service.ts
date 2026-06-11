import {
  BadRequestException,
  ConflictException,
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
      owner: true,
      services: true,
      fuels: true,
      expenses: true,
      documents: true,
      reminders: true,
    },
  });

  if (!car) return null;

  const fuelStats = await this.prisma.fuelRecord.aggregate({
    where: {
      carId,
    },
    _avg: {
      consumption: true,
      pricePerLiter: true,
    }
  });

  return {
    ...car,
    averageFuelConsumption: Number(fuelStats._avg.consumption ?? 0),
    averageFuelPrice: Number(fuelStats._avg.pricePerLiter ?? 0),
  };
}


  update(id: number, updateCarDto: UpdateCarDto) {
    return `This action updates a #${id} car`;
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
          imageUrl: file ? file.filename : undefined,
          ownerId: userId,
        },
      });
    } catch (error) {
      if (file) {
        await unlink(file.path).catch(() => null);
      }

      throw error;
    }
  }


}

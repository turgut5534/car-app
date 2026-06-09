import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateServiceDto } from './dto/create-service.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCarDto, userId: string) {
    const existingCar = await this.prisma.car.findFirst({
      where: {
        plate: dto.plate,
      },
    });

    if (existingCar) {
      throw new ConflictException('Plate already exists');
    }

    return this.prisma.car.create({
      data: {
        ...dto,
        ownerId: userId,
      },
    });
  }

  async findAll(userId: string) {
    const cars = await this.prisma.car.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        owner: true,
      },
    });

    return cars;
  }

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

    console.log(carId);
    return car;
  }

  async saveService(carId: string, userId: string, dto: CreateServiceDto) {
    const car = await this.prisma.car.findFirst({
      where: {
        id: carId,
        ownerId: userId,
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return this.prisma.serviceRecord.create({
      data: {
        ...dto,
        carId: carId,
        serviceDate: new Date(dto.serviceDate),
      },
    });

    return car;
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

  async createWithImage(dto: CreateCarDto, userId: string, file?: any) {
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

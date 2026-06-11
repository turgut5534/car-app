import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/prisma.service';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const service = await this.prisma.serviceRecord.findFirst({
      where: {
        id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async findAll(carId: string): Promise<Service[]> {
    
    const services = await this.prisma.serviceRecord.findMany({
      where: {
        carId,
      },
    });

    return services;
  }

  async create(userId: string, dto: CreateServiceDto) {
    const car = await this.prisma.car.findFirst({
      where: {
        id: dto.carId,
        ownerId: userId,
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (dto.km < car.currentKm) {
      throw new BadRequestException(
        'New mileage must be greater than or equal to current mileage',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const newService = await tx.serviceRecord.create({
        data: {
          carId: dto.carId,
          title: dto.title,
          km: dto.km,
          amount: dto.amount,
          serviceDate: new Date(dto.serviceDate),
        },
      });

      await tx.car.update({
        where: {
          id: dto.carId,
        },
        data: {
          currentKm: dto.km,
        },
      });

      return newService;
    });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`;
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }
}

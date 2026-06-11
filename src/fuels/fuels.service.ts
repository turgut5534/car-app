import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FuelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return `This action returns all fuels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fuel`;
  }

  async create(userId: string, dto: CreateFuelDto) {
    const car = await this.prisma.car.findFirst({
      where: {
        id: dto.carId,
        ownerId: userId,
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const mileage = car.currentKm;

    if (dto.km <= mileage) {
      throw new BadRequestException(
        'New milaage must be greater than current mileage',
      );
    }

    const liters = dto.totalAmount / dto.pricePerLiter;

    const previousRecord = await this.prisma.fuelRecord.findFirst({
      where: {
        carId: dto.carId,
      },
      orderBy: {
        fuelDate: 'desc',
      },
    });

    let consumption: number;
    let kmDif: number;

    if (!previousRecord) {
      kmDif = dto.km - car.currentKm;
    } else {
      kmDif = dto.km - previousRecord.km;
    }

    consumption = (liters * 100) / kmDif;

    return this.prisma.$transaction(async (tx) => {
      const newRecord = await tx.fuelRecord.create({
        data: {
          ...dto,
          carId: dto.carId,
          createdById: userId,
          fuelDate: new Date(),
          liters,
          consumption,
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

      return newRecord;
    });
  }

  update(id: number, updateFuelDto: UpdateFuelDto) {
    return `This action updates a #${id} fuel`;
  }

  remove(id: number) {
    return `This action removes a #${id} fuel`;
  }
}

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
import { CreateServiceDto } from './dto/create-service.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateFuelDto } from './dto/create-fuel.dto';

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

    const mileage = car.currentKm;

    if (dto.km < mileage) {
      throw new BadRequestException(
        'New milaage must be greater than current mileage',
      );
    }
    const newService = this.prisma.serviceRecord.create({
      data: {
        ...dto,
        carId: carId,
        serviceDate: new Date(dto.serviceDate),
      },
    });

    await this.prisma.car.update({
      where: {
        id: carId,
      },
      data: {
        currentKm: dto.km,
      },
    });

    return newService;
  }

  async saveFuel(carId: string, userId: string, dto: CreateFuelDto) {
    const car = await this.prisma.car.findFirst({
      where: {
        id: carId,
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
        carId,
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

    const newRecord = this.prisma.fuelRecord.create({
      data: {
        ...dto,
        carId: carId,
        createdById: userId,
        fuelDate: new Date(),
        liters,
        consumption,
      },
    });

    await this.prisma.car.update({
      where: {
        id: carId,
      },
      data: {
        currentKm: dto.km,
      },
    });

    return newRecord;
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

  async addNewDocument(
    dto: CreateDocumentDto,
    userId: string,
    carId: string,
    file?: any,
  ) {
    try {
      return await this.prisma.document.create({
        data: {
          ...dto,
          carId: carId,
          fileUrl: file ? file.filename : undefined,
          uploadedById: userId,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
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

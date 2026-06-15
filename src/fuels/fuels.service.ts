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

  async findAll(carId: string) {
    const fuels = await this.prisma.fuelRecord.findMany({
      where: {
        carId,
      },
      include: {
        createdBy: {
          select: {
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const fuelStats = await this.prisma.fuelRecord.aggregate({
      where: {
        carId,
      },
      _avg: {
        consumption: true,
        pricePerLiter: true,
      },
    });

    return {
      fuels,
      averageFuelConsumption: Number(fuelStats._avg.consumption ?? 0),
      averageFuelPrice: Number(fuelStats._avg.pricePerLiter ?? 0),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} fuel`;
  }

  async create(
    userId: string,
    dto: CreateFuelDto,
    files: Express.Multer.File[],
  ) {
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

    if (Number(dto.km) <= mileage) {
      throw new BadRequestException(
        'New milaage must be greater than current mileage',
      );
    }

    const liters: number = Number(dto.totalAmount) / Number(dto.pricePerLiter);

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
      kmDif = Number(dto.km) - car.currentKm;
    } else {
      kmDif = Number(dto.km) - previousRecord.km;
    }

    consumption = (liters * 100) / kmDif;

    return this.prisma.$transaction(async (tx) => {
      const newRecord = await tx.fuelRecord.create({
        data: {
          carId: dto.carId,
          createdById: userId,
          fuelDate: new Date(),
          pricePerLiter: Number(dto.pricePerLiter),
          liters,
          consumption,
          km: Number(dto.km),
          totalAmount: Number(dto.totalAmount),
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
          currentKm: Number(dto.km),
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

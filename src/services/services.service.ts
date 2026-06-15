import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/prisma.service';
import { Service } from './entities/service.entity';
import { Decimal } from '@prisma/client/runtime/client';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const service = await this.prisma.serviceRecord.findFirst({
      where: {
        id,
      },
      include: {
        createdBy: true,
        car: true,
        attachments: true,
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
      include: {
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return services;
  }

  async create(
    userId: string,
    dto: CreateServiceDto,
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

    if (Number(dto.km) < car.currentKm) {
      throw new BadRequestException(
        'New mileage must be greater than or equal to current mileage',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      try {

        const newService = await tx.serviceRecord.create({
          data: {
            carId: dto.carId,
            createdById: userId,
            title: dto.title,
            description: dto.description,
            category: dto.category,
            km: Number(dto.km),
            amount: dto.amount ? Number(dto.amount) : 0,
            serviceDate: new Date(dto.serviceDate),
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

        return newService;
      } catch (error) {
        console.log(error);
        for (const file of files ?? []) {
          try {
            await unlink(file.path);
          } catch (err) {
            // ignore delete error
          }
        }
      }
    });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`;
  }

  async remove(id: string) {
    const service = await this.prisma.serviceRecord.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const files = service.attachments;

    // 1. Delete physical files
    for (const file of files) {
      try {
        const filePath = join(
          process.cwd(),
          'uploads/services',
          file.fileName,
        );

        await unlink(filePath);
      } catch (err) {
        console.log('File delete error:', err);
      }
    }

    // 2. Delete DB records (attachments first if no cascade)
    await this.prisma.serviceAttachment.deleteMany({
      where: { serviceRecordId: id },
    });

    // 3. Delete service itself
    await this.prisma.serviceRecord.delete({
      where: { id },
    });

    return { success: true };
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CarsService {

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCarDto, userId : string) {

    const existingCar = await this.prisma.car.findFirst({
      where: {
          plate: dto.plate
      }
    })

    if (existingCar) {
      throw new ConflictException('Plate already exists');
    }

    return this.prisma.car.create({
      data: {
        ...dto,
        ownerId: userId
      }
    })
  }

  async findAll(userId : string) {

    const cars = await this.prisma.car.findMany({
      where: {
        ownerId: userId
      }
    })

    return cars
  }

  findOne(id: number) {
    return `This action returns a #${id} car`;
  }

  update(id: number, updateCarDto: UpdateCarDto) {
    return `This action updates a #${id} car`;
  }

  remove(id: number) {
    return `This action removes a #${id} car`;
  }
}

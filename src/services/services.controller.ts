import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UserId } from 'src/auth/decorators/current-user.decorator';
import { Service } from './entities/service.entity';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';

@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query('carId') carId: string) : Promise<Service[]> {
    return this.servicesService.findAll(carId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }

  @Post()
  create(@UserId() userId: string,@Body() createServiceDto: CreateServiceDto,) {
    return this.servicesService.create(userId, createServiceDto);
  }
}

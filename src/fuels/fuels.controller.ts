import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FuelsService } from './fuels.service';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { UserId } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';

@UseGuards(JwtAuthGuard)
@Controller('fuels')
export class FuelsController {
  constructor(private readonly fuelsService: FuelsService) {}

  @Get()
  findAll(@Query('carId') carId: string) {
    return this.fuelsService.findAll(carId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fuelsService.findOne(+id);
  }

  @Post()
  create(
    @UserId() userId: string,
    @Body() createFuelDto: CreateFuelDto,
  ) {
    return this.fuelsService.create(userId, createFuelDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFuelDto: UpdateFuelDto) {
    return this.fuelsService.update(+id, updateFuelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fuelsService.remove(+id);
  }
}

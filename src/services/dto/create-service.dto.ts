import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ServiceCategory } from 'src/generated/prisma/enums';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  carId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsNotEmpty()
  @IsString()
  km!: string;

  @IsDateString()
  serviceDate!: string;

  @IsEnum(ServiceCategory)
  category!: ServiceCategory;
}
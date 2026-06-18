import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsDate,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory } from 'src/generated/prisma/enums';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  carId!: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @Type(() => Number)
  @IsInt()
  km!: number;

  @Type(() => Date)
  @IsDate()
  serviceDate!: Date;

  @IsEnum(ServiceCategory)
  category!: ServiceCategory;
}
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  LPG = 'LPG',
  ELECTRIC = 'ELECTRIC',
}

export class CreateCarDto {
  @IsOptional()
  @IsString()
  plate?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentKm?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
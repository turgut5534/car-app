import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFuelDto {
  @IsString()
  @IsNotEmpty()
  carId!: string;

  @IsOptional()
  @IsString()
  station?: string;

  @IsOptional()
  @Type(() => Number)
  @IsString()
  @Min(0)
  liters?: string;

  @IsString()
  pricePerLiter!: string;

  @IsString()
  totalAmount!: string;

  @IsString()
  km!: string;

  @IsOptional()
  @IsUUID()
  fuelCardTransactionId?: string;
}

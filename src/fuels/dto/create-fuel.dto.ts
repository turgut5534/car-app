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
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  liters?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerLiter!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  km!: number;

  @IsOptional()
  @IsUUID()
  fuelCardTransactionId?: string;
}

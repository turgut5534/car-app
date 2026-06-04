import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCarDto {
  @IsString()
  name!: string;

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
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentKm?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
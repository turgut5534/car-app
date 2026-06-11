import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsDateString,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  carId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsInt()
  km!: number;

  @IsDateString()
  serviceDate!: string;
}

import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseCategory } from 'src/generated/prisma/enums';

export class CreateExpenseDto {
  @IsString()
  carId!: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @IsString()
  title!: string;

  @Type(() => Number)
  @IsInt()
  mileage?: number = 0;

  @IsOptional()
  @IsString()
  description?: string;

  // Prisma Decimal comes as string/number depending on config
  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @Type(() => Date)
  @IsDate()
  expenseDate!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  convertedAmount?: number;

  @IsOptional()
  @IsString()
  convertedCurrency?: string;
}

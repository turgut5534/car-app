import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsOptional()
  @IsString()
  name?: string

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
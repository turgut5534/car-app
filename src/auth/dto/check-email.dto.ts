import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
export class CheckEmailDto {
  @IsEmail()
  email!: string;
}

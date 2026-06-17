import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @MinLength(8)
  password!: string;

  @MinLength(8)
  passwordAgain!: string;

  @IsEmail()
  email!: string;
}

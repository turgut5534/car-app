import { IsString, MinLength } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class CheckPasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
  
  @IsString()
  @MinLength(6)
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword!: string;
}

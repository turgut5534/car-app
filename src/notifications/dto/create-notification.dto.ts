// src/notifications/dto/create-notification.dto.ts

import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from 'src/generated/prisma/enums';

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType = NotificationType.INFO;

  @IsOptional()
  payload?: Record<string, any>;
}
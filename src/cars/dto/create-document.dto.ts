import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { DocumentType } from 'src/generated/prisma/enums';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  carId!: string;

  @IsOptional()
  @IsString()
  uploadedById?: string;

  @IsEnum(DocumentType)
  type!: DocumentType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
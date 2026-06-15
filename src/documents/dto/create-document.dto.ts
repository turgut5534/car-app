import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
  @IsOptional()
  title!: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

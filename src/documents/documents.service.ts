import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma.service';
import { unlink } from 'fs/promises';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(carId: string) {
    const documents = await this.prisma.document.findMany({
      where: {
        carId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return documents;
  }

  async findOne(id: string, userId: string) {
    const document = this.prisma.document.findFirst({
      where: {
        id,
      },
      include: {
        car: {
          include: {
            photos: {
              orderBy: [{ is_cover: 'desc' }, { createdAt: 'asc' }],
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async create(dto: CreateDocumentDto, userId: string, file?: any) {
    try {
      return await this.prisma.document.create({
        data: {
          ...dto,
          carId: dto.carId,
          fileUrl: file ? file.filename : undefined,
          uploadedById: userId,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        },
      });
    } catch (error) {
      if (file) {
        await unlink(file.path).catch(() => null);
      }

      throw error;
    }
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}

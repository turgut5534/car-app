import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma.service';
import { unlink } from 'fs/promises';
import { join } from 'path';

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
        attachments: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async create(
    dto: CreateDocumentDto,
    userId: string,
    files: Express.Multer.File[],
  ) {
    try {
      return this.prisma.$transaction(async (prisma) => {
        const document = await prisma.document.create({
          data: {
            ...dto,
            carId: dto.carId,
            uploadedById: userId,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            attachments: {
              create: files.map((file) => ({
                url: file.path,
                fileName: file.filename,
                mimeType: file.mimetype,
              })),
            },
          },
        });

        return document;
      });
    } catch (error) {
      for (const file of files ?? []) {
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

  async removeAttachment(id: string, attachmentId: string) {
    const attachment = await this.prisma.documentAttachment.findFirst({
      where: {
        id: attachmentId,
        documentId: id,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    await this.prisma.documentAttachment.delete({
      where: {
        id: attachmentId,
        documentId: id,
      },
    });

    try {
      const filePath = join(
        process.cwd(),
        'uploads/documents',
        attachment.fileName,
      );
      await unlink(filePath);
    } catch (err) {
      console.log('File delete error:', err);
    }

    return { message: 'Attachment removed successfully' };
  }
}

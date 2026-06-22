import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  create(createFamilyDto: CreateFamilyDto) {
    return 'This action adds a new family';
  }

  async findMyFamily(userId: string) {
    const family = await this.prisma.family.findUnique({
      where: {
        ownerId: userId,
      },
    });

    if (!family) {
      throw new NotFoundException('You have no family');
    }

    return family;
  }

  async findFamilyMembers(userId: string) {
    const family = await this.prisma.family.findUnique({
      where: {
        ownerId: userId,
      },
    });

    if (!family) {
      throw new NotFoundException('You have no family');
    }

    const familyMembers = await this.prisma.familyMember.findMany({
      where: {
        familyId: family.id,
      },
      include: {
        user: true,
      },
    });

    return {
      members: familyMembers.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        picture: m.user.picture,
        role: m.role,
      })),
      family,
    };
  }

  async inviteUser(familyId, email: string) {
    try {
      const invitedUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!invitedUser) {
        throw new NotFoundException('User not found');
      }

      const currentFamily = await this.prisma.family.findUnique({
        where: {
          id: familyId,
        },
      });

      if (!currentFamily) {
        throw new NotFoundException('Family not found');
      }

      const existing = await this.prisma.familyMember.findUnique({
        where: {
          familyId_userId: {
            familyId: currentFamily.id,
            userId: invitedUser.id,
          },
        },
      });

      if (existing) {
        if(!existing.is_approved) {
          throw new BadRequestException('You already sent invitation');
        }
        throw new BadRequestException('User is already in the family');
      }

      await this.prisma.familyMember.create({
        data: {
          familyId: currentFamily.id,
          userId: invitedUser.id,
        },
      });

      return invitedUser;
      
    } catch (e) {
      console.log(e);
    }
  }

  update(id: number, updateFamilyDto: UpdateFamilyDto) {
    return `This action updates a #${id} family`;
  }

  remove(id: number) {
    return `This action removes a #${id} family`;
  }
}

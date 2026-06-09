import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DashboardService {

    constructor(
      private readonly prisma: PrismaService
    ) {}
  
  async getDashboard(userId : string) {

    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      include: {
        ownedCars: true,
        reminders: true,
        createdExpenses: true
      }
    })

    if(!user){
      throw new NotFoundException('User not found')
    }

    return user
    

  }
}

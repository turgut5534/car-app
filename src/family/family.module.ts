import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  imports: [AuthModule],
  controllers: [FamilyController],
  providers: [FamilyService, PrismaService, NotificationsService],
  exports: [FamilyService]
})
export class FamilyModule {}

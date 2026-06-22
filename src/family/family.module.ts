import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [FamilyController],
  providers: [FamilyService, PrismaService],
  exports: [FamilyService]
})
export class FamilyModule {}

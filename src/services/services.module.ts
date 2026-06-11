import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [ServicesController],
  providers: [ServicesService, PrismaService],
  exports: [ServicesService],
})
export class ServicesModule {}

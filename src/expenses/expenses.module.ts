import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, PrismaService],
  exports: [ExpensesService]
})
export class ExpensesModule {}

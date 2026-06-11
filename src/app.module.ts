import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DocumentsModule } from './documents/documents.module';
import { ServicesModule } from './services/services.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FuelsModule } from './fuels/fuels.module';

@Module({
  imports: [UsersModule, CarsModule, AuthModule, DashboardModule, DocumentsModule, ServicesModule, ExpensesModule, FuelsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

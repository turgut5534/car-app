import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, CarsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { FuelsService } from './fuels.service';
import { FuelsController } from './fuels.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FuelsController],
  providers: [FuelsService],
  exports: [FuelsService],
})
export class FuelsModule {}

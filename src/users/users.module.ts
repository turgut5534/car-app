import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [AuthModule],
    providers:[PrismaService, UsersService],
    controllers: [UsersController],
    exports: [UsersService]
})
export class UsersModule {}

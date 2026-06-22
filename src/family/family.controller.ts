import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-guard';
import { UserId } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familyService.create(createFamilyDto);
  }

  @Get('me')
  findMyFamily(@UserId() userId: string) {
    return this.familyService.findMyFamily(userId);
  }

  @Get('members')
  findFamilyMembers(@UserId() userId: string) {
    return this.familyService.findFamilyMembers(userId);
  }

  @Post(':id/invite')
  inviteUser(@Param('id') familyId: string , @Body('email') email: string) {
    console.log(familyId )
    return this.familyService.inviteUser(familyId, email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familyService.update(+id, updateFamilyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familyService.remove(+id);
  }
}

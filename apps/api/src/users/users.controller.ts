import { Controller, Get, Param, Delete, UseGuards, HttpCode, HttpStatus, Patch, Body, Request, Post, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminUpdateUserDto, CreateUserDto, UpdatePasswordDto, UpdateProfileDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Patch('profile/password')
  async updatePassword(@Request() req: any, @Body() dto: UpdatePasswordDto) {
    await this.usersService.updatePassword(req.user.id, dto.newPassword);
    return { success: true };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) {
    const existing = await this.usersService.findOneByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      role: dto.role,
      passwordHash,
    });
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateAsAdmin(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
  }
}

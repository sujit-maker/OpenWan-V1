import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  InternalServerErrorException,
  BadRequestException,
  Query,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from 'src/auth/auth.service';
import { User } from './user.decorator';
import { UserType } from './user-type.enum';

export interface User {
  id: number;
  username: string;
  usertype: string;
  adminId: number;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('count/admin/:adminId')
  async getUsersCount(@Param('adminId') adminId: string): Promise<number> {
    const parsedAdminId = parseInt(adminId, 10);

    if (isNaN(parsedAdminId)) {
      throw new HttpException('Invalid admin ID', HttpStatus.BAD_REQUEST);
    }

    return this.userService.getUserCountByAdminId(parsedAdminId);
  }

  // @Get('count/manager/:managerId')
  // async getExecutiveCount(
  //   @Param('managerId') managerId: string,
  // ): Promise<number> {
  //   // Parse the managerId to a number
  //   const parsedManagerId = parseInt(managerId, 10);

  //   if (isNaN(parsedManagerId)) {
  //     throw new HttpException('Invalid manager ID', HttpStatus.BAD_REQUEST);
  //   }

  //   return this.userService.getUserCountByManagerId(parsedManagerId);
  // }

  // @Get('count/executives/admin/:adminId')
  // async getExecutivesCount(@Param('adminId') adminId: string): Promise<number> {
  //   const parsedAdminId = parseInt(adminId, 10);

  //   if (isNaN(parsedAdminId)) {
  //     throw new HttpException('Invalid admin ID', HttpStatus.BAD_REQUEST);
  //   }

  //   return this.userService.getExecutiveCountByAdminId(parsedAdminId);
  // }

  @Get('counts')
  async getUserCounts() {
    return this.userService.getUserCounts();
  }

  @Get('managers')
  async findManagers() {
    try {
      return await this.userService.findManagers();
    } catch (error) {
      console.error('Error in findManagers controller:', error);
      throw new InternalServerErrorException('Failed to fetch managers.');
    }
  }

  @Get('admins')
  async findAdmins() {
    try {
      return await this.userService.findAdmins();
    } catch (error) {
      console.error('Error in findAdmins controller:', error);
      throw new InternalServerErrorException('Failed to fetch managers.');
    }
  }

  // Fetch admins based on managerId
  @Get('admins/manager')
  async findAdminsByManager(@Query('managerId') managerId: string) {
    const id = parseInt(managerId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('managerId must be a number');
    }
    try {
      return await this.userService.findAdminsByManagerId(id);
    } catch (error) {
      console.error('Error in findAdminsByManager controller:', error);
      throw new InternalServerErrorException('Failed to fetch admins by manager ID');
    }
  }

  @Get('managers/admin')
  async findManagersByAdmin(@Query('adminId') adminId: string) {
    const id = parseInt(adminId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('adminId must be a number');
    }
    return this.userService.findManagersByAdminId(id);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get('all')
  async findAssociateUsersByAdmin(@User() user: any) {
    if (user.usertype !== 'ADMIN') {
      throw new UnauthorizedException(
        'You do not have permission to access this resource.',
      );
    }

    try {
      // Fetch the users associated with the logged-in admin
      const users = await this.userService.findUsersByAdminId(user.id);
      return users;
    } catch (error) {
      console.error('Error fetching users for admin:', error);
      throw new InternalServerErrorException(
        'Failed to fetch users for admin.',
      );
    }
  }

  @Get('ad')
  async getUsersByAdminId(@Query('adminId') adminId: string): Promise<User[]> {
    // Convert adminId to a number
    const parsedAdminId = parseInt(adminId, 10);
    if (isNaN(parsedAdminId)) {
      throw new BadRequestException('Invalid adminId');
    }
    return await this.userService.findUsersByAdminId(parsedAdminId);
  }

  // @Get('executives')
  // async findExecutivesByManager(@Query('managerId') managerId: string) {
  //   // Check if managerId is provided
  //   if (!managerId || managerId.trim() === '') {
  //     throw new BadRequestException('Manager ID is required');
  //   }

  //   // Convert managerId to a number
  //   const managerIdNumber = parseInt(managerId.trim(), 10);

  //   // Validate if managerId is a number and is greater than 0
  //   if (isNaN(managerIdNumber) || managerIdNumber <= 0) {
  //     throw new BadRequestException('Invalid manager ID format');
  //   }

  //   try {
  //     const executives =
  //       await this.userService.findExecutivesByManager(managerIdNumber);
  //     return executives;
  //   } catch (error) {
  //     console.error('Error fetching executives:', error);
  //     throw new InternalServerErrorException(
  //       'An error occurred while fetching executives',
  //     );
  //   }
  // }

   // Endpoint to get deviceId for a user
   @Get(':id/deviceId')
   async getDeviceId(@Param('id') id: string) {
     const user = await this.userService.getDeviceIdForUser(id);
     if (!user) {
       throw new NotFoundException(`User with id ${id} not found`);
     }
     return { deviceId: user.deviceId };
 }
 
 

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      throw new BadRequestException('Invalid ID format');
    }
    try {
      return await this.userService.findOne(idNumber);
    } catch (error) {
      console.error('Error in findOne controller:', error);
      throw new InternalServerErrorException('Failed to fetch user.');
    }
  }

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const { usertype, managerId, adminId, deviceId } = createUserDto;
  
    // Validate usertype and dependencies
    if (usertype === UserType.EXECUTIVE && !managerId) {
      throw new BadRequestException(
        'managerId is required for EXECUTIVE user type',
      );
    }
  
    try {
      return await this.userService.createUser(
        createUserDto,
        managerId,
        adminId,
      );
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }
  

  @Post('exe')
async createExecutive(
  @Body() createExecutiveDto: CreateUserDto,
  @User() user: any,
) {
  // Add managerId and adminId to the DTO
  createExecutiveDto.managerId = user.id; // Assign the logged-in user's ID as managerId
  const adminId = user.adminId;          // Extract adminId from the logged-in user
  createExecutiveDto.deviceId = user.deviceId; // Extract deviceId from the logged-in user

  console.log('Creating Executive:', {
    createExecutiveDto,
    managerId: createExecutiveDto.managerId,
    adminId,
    deviceId: createExecutiveDto.deviceId,
  });

  try {
    // Pass the updated DTO, managerId, and adminId to the userService
    return await this.userService.createUser(
      createExecutiveDto,
      createExecutiveDto.managerId,
      adminId,
    );
  } catch (error) {
    console.error('Error creating executive:', error);
    throw new InternalServerErrorException('Failed to create executive.');
  }
}


  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.update(Number(id), updateUserDto);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException('Failed to update user.');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.userService.remove(Number(id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new InternalServerErrorException('Failed to delete user.');
    }
  }

  @Patch(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.authService.changePassword(
      userId,
      changePasswordDto.newPassword,
      changePasswordDto.confirmPassword,
    );
  }
}

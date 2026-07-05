import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserService } from './providers/user.service';
import { UserResponseDto } from './dtos/user-response.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Role } from 'src/generated/prisma/enums';
import { UserUpdateDto } from './dtos/user-update.dto';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ChangePasswordDto } from './dtos/user-password-chg.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  //get user profile
  @Get('me')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve the profile information of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    const userId = req.user.id;
    return await this.userService.getUserById(userId);
  }

  //get all user for admin purposes
  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getAllUsers();
  }

  //get user by id for admin purposes
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a user by their ID (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userService.getUserById(id);
  }

  //update user profile
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UserUpdateDto })
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update the profile information of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserUpdateDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() body: Partial<UserUpdateDto>,
  ): Promise<UserResponseDto> {
    const userId = req.user.id;
    return await this.userService.updateUser(userId, body);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user password',
    description: 'Update the password of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User password updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePassword(
    @GetUser('id') userId: string,
    @Body() body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.userService.updatePassword(
      userId,
      body.oldPassword,
      body.newPassword,
    );
    return { message: 'Password updated successfully' };
  }

  //delete User profile
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user by ID',
    description: 'Delete a user by their ID ',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteUser(
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    return await this.userService.deleteUser(userId);
  }

  //delete user by id for admin purposes
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete user by ID (Admin only) ',
    description: 'Delete a user by their ID (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteUserById(@Param('id') userId: string) {
    return await this.userService.deleteUser(userId);
  }
}

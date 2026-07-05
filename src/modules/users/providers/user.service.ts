import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserUpdateDto } from '../dtos/user-update.dto';
import { HashProvider } from 'src/modules/auth/providers/hash.provider';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashProvider: HashProvider,
  ) {}

  //get user by id
  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  //get all users
  async getAllUsers(): Promise<UserResponseDto[]> {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //update user
  async updateUser(id: string, data: UserUpdateDto): Promise<UserResponseDto> {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== userExists.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictException('Email is already in use by another user');
      }
    }

    return await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  //update user password
  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const existUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existUser) {
      throw new NotFoundException('User not found');
    }
    const isPasswordVal = await this.hashProvider.compare(
      oldPassword,
      existUser.password,
    );
    if (!isPasswordVal) {
      throw new ConflictException('Old password is incorrect');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: await this.hashProvider.hash(newPassword) },
    });
    return { message: 'Password updated successfully' };
  }

  //delete user
  async deleteUser(id: string): Promise<{ message: string }> {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'User deleted successfully' };
  }
}

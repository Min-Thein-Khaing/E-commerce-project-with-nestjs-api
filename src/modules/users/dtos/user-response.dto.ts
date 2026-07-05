import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id!: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email!: string;

  @ApiProperty({
    description: 'User first name',
    nullable: true,
    example: 'John',
  })
  firstName!: string | null;
  @ApiProperty({
    description: 'User last name',
    nullable: true,
    example: 'Doe',
  })
  lastName!: string | null;
  @ApiProperty({ description: 'User role', enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({
    description: 'User creation date',
    example: new Date(),
  })
  createdAt!: Date;
  @ApiProperty({
    description: 'User last updated date',
    example: new Date(),
  })
  updatedAt!: Date;
}

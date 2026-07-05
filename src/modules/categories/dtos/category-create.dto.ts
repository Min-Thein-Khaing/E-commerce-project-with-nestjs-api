import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', required: true })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Electronics category' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ example: 'electronics' })
  @IsNotEmpty()
  @IsString()
  slug!: string;
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @MaxLength(255)
  imageUrl?: string;
  @ApiProperty({ example: true })
  @IsOptional()
  isActive?: boolean;
}

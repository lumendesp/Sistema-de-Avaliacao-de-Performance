import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsBoolean,
  MinLength,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRoleDto } from './user-role.dto';

export class CreateUserDto {
  @ApiProperty({ example: 'Alice Johnson' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'alice.j' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ type: [UserRoleDto], description: 'User roles' })
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => UserRoleDto)
  roles: UserRoleDto[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsUrl()
  photo?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  positionId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  unitId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  trackId?: number;
}

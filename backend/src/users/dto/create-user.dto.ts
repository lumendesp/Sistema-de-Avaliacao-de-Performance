import {
  IsEmail,
  IsNotEmpty,
  IsString,
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

  @ApiProperty({ example: true })
  active?: boolean;

  @ApiProperty({ example: 'https://example.com/photo.jpg' })
  photo?: string;

  @ApiProperty({ example: 1 })
  positionId?: number;

  @ApiProperty({ example: 1 })
  unitId?: number;

  @ApiProperty({ example: 1 })
  trackId?: number;
}

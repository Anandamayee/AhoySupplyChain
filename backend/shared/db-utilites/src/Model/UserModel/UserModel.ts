import { UserRole } from '@app/db-utilites/Enums/enums';
// import { UserRole } from '../../Enums/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

export class UserDetails {
  @ApiProperty({
    description: 'name',
    example: 'User Name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'firm name',
    example: 'tea farm',
    type: String,
  })
  @IsString()
  firmName: string;

  @ApiProperty({
    description: 'User role',
    example: 'Farmer',
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'user role' })
  role: UserRole;

  @ApiProperty({
    description: 'GSTNumber',
    example: '123456F',
    type: String,
  })
  @IsString()
  GSTNumber: string;

  @ApiProperty({
    description: 'Mobile number',
    example: '0987654321',
    type: String,
  })
  @IsString()
  mobileNumber: string;

  @ApiProperty({
    description: 'Address',
    example: 'bengaluru',
    type: String,
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Blockcchain Hash',
    example: '0x98765',
    type: String,
  })
  @IsString()
  registerTeaTokenPlayersTxHash:string
}

export class LoginResposne {
  @ApiProperty({
    description: 'success',
    example: 'true',
    type: String,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'GSTNumber',
    example: '123456F',
    type: String,
  })
  @IsString()
  GSTNumber: string;

  @IsEnum(UserRole, { message: 'user role' })
  role: UserRole;

  @ApiProperty({
    description: 'firmName',
    example: 'ABC',
    type: String,
  })
  @IsString()
  firmName: string;

  @ApiProperty({
    description: 'accessToken',
    example: 'etayuctyactguchuasc',
    type: String,
  })
  @IsString()
  accessToken: string;
  @IsString()
  refreshSessionId: string;
}

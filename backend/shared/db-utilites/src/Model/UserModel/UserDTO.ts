import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../Enums/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({
    description: 'name',
    example: 'User Name',
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User role',
    example: 'Farmer',
    enum: UserRole,
    required: true,
  })
  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @ApiProperty({
    description: 'Firm name',
    example: 'tea farm',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Firm name is required' })
  firmName: string;

  @ApiProperty({
    description: 'GSTNumber',
    example: '123456F',
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'GSTNumber is required' })
  @IsString()
  GSTNumber: string;

  @ApiProperty({
    description: 'Mobile number',
    example: '0987654321',
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'Mobile number is required' })
  @IsPhoneNumber('IN', { message: 'The phone number is not valid for the India region.' })
  mobileNumber: string;

  @ApiProperty({
    description: 'Password ',
    example: '0987654321',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Please enter password' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1
  },{
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'Address',
    example: 'Bengaluru',
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'Address number is required' })
  @IsString()
  address: string;
}

export class LoginUserDTO {
  @ApiProperty({
    description: 'GSTNumber',
    example: '123456F',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'GSTNumber is required' })
  GSTNumber: string;

  @ApiProperty({
    description: 'Password ',
    example: '0987654321',
    type: String,
    required: true,
  })
  @IsStrongPassword()
  @IsNotEmpty({ message: 'Please enter password' })
  password: string;
}

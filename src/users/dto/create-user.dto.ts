import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { Unique } from 'typeorm';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

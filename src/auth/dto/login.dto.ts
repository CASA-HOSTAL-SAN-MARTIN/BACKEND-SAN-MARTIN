import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail()
  @MaxLength(150)
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  contrasena!: string;
}

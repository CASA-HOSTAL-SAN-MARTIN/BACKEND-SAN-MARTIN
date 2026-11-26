import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  token!: string;

  @IsString()
  @MinLength(9)
  @MaxLength(72)
  contrasena!: string;
}

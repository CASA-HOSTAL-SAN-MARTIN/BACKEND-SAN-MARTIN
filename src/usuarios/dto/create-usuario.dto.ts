import { Transform } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';

export class CreateUsuarioDto {
  @IsEmail()
  @MaxLength(150)
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  correo!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  contrasena!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles!: Role[];
}

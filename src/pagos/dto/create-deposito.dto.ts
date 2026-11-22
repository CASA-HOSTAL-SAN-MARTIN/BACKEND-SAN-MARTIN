import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MetodoPago } from '../enums/metodo-pago.enum';

export class CreateDepositoDto {
  @ApiProperty({
    description: 'Identificador del residente que realiza el depósito',
    example: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  residenteId!: string;

  @ApiProperty({
    description: 'Monto del depósito o garantía en pesos colombianos',
    example: 150000,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  monto!: number;

  @ApiProperty({
    description: 'Fecha en que se realizó el depósito (YYYY-MM-DD)',
    example: '2026-11-20',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaPago?: string;

  @ApiProperty({
    description: 'Método utilizado para realizar el depósito',
    enum: MetodoPago,
    default: MetodoPago.TRANSFERENCIA,
    required: false,
  })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @ApiProperty({
    description: 'Número de comprobante o referencia de la transacción',
    example: 'DEP-123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia?: string;

  @ApiProperty({
    description: 'Observaciones o concepto del depósito (ej. depósito de garantía)',
    example: 'Depósito de garantía por inventario inicial',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

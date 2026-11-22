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

export class CreatePagoDto {
  @ApiProperty({
    description: 'Identificador del residente',
    example: 'b6f2e7fb-1d9a-4d7d-9bc5-1a15e72f21cb',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  residenteId!: string;

  @ApiProperty({
    description: 'Monto pagado en pesos colombianos',
    example: 350000,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  monto!: number;

  @ApiProperty({
    description: 'Fecha en que se realizó el pago (YYYY-MM-DD)',
    example: '2026-11-20',
  })
  @IsDateString()
  fechaPago!: string;

  @ApiProperty({
    description: 'Método utilizado para realizar el pago',
    enum: MetodoPago,
    default: MetodoPago.TRANSFERENCIA,
    required: false,
  })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @ApiProperty({
    description: 'Número de comprobante, recibo o referencia bancaria',
    example: 'TRANS-987654',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia?: string;

  @ApiProperty({
    description: 'Observaciones adicionales sobre el pago',
    example: 'Pago correspondiente al mes de noviembre',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

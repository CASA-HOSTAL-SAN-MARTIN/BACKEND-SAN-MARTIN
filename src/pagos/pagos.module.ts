import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositosController } from './depositos.controller';
import { Pago } from './entities/pago.entity';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { ResidentesPagosController } from './residentes-pagos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pago])],
  controllers: [PagosController, DepositosController, ResidentesPagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}

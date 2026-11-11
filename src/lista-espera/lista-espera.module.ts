import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntradaListaEspera } from './entities/entrada-lista-espera.entity';
import { ListaEsperaController } from './lista-espera.controller';
import { ListaEsperaService } from './lista-espera.service';

@Module({
  imports: [TypeOrmModule.forFeature([EntradaListaEspera])],
  controllers: [ListaEsperaController],
  providers: [ListaEsperaService],
  exports: [ListaEsperaService],
})
export class ListaEsperaModule {}

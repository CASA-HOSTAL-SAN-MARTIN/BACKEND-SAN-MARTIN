import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aspirante } from '../aspirantes/entities/aspirante.entity';
import { EntradaListaEspera } from './entities/entrada-lista-espera.entity';
import { ListaEsperaController } from './lista-espera.controller';
import { ListaEsperaService } from './lista-espera.service';

@Module({
  imports: [TypeOrmModule.forFeature([EntradaListaEspera, Aspirante])],
  controllers: [ListaEsperaController],
  providers: [ListaEsperaService],
})
export class ListaEsperaModule {}

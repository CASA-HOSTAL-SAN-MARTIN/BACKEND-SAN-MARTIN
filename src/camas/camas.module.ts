import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CamasController } from './camas.controller';
import { CamasService } from './camas.service';
import { Cama } from './entities/cama.entity';
import { Habitacion } from './entities/habitacion.entity';
import { AsignacionCama } from '../asignaciones/entities/asignacion-cama.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cama, Habitacion, AsignacionCama])],
  controllers: [CamasController],
  providers: [CamasService],
  exports: [CamasService],
})
export class CamasModule {}

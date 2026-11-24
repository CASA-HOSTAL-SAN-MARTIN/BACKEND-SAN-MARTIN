import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionCama } from './entities/asignacion-cama.entity';
import { Cama } from '../camas/entities/cama.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionCama, Cama])],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}

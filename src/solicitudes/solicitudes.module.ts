import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Rol } from '../auth/entities/rol.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Solicitud, Usuario, Rol])],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
  exports: [SolicitudesService],
})
export class SolicitudesModule {}

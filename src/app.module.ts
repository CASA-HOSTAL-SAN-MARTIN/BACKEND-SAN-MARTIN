import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnvironment } from './config/environment.validation';
import { AppHealthModule } from './health/health.module';
import { AspirantesModule } from './aspirantes/aspirantes.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { AlojamientoModule } from './alojamiento/alojamiento.module';
import { CommonModule } from './common/common.module';
import { ContratosModule } from './contratos/contratos.module';
import { IncidentesModule } from './incidentes/incidentes.module';
import { InventarioModule } from './inventario/inventario.module';
import { MantenimientoModule } from './mantenimiento/mantenimiento.module';
import { PagosModule } from './pagos/pagos.module';
import { ResidentesModule } from './residentes/residentes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VisitasModule } from './visitas/visitas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    UsuariosModule,
    AspirantesModule,
    ResidentesModule,
    AlojamientoModule,
    ContratosModule,
    PagosModule,
    InventarioModule,
    MantenimientoModule,
    IncidentesModule,
    VisitasModule,
    AuditoriaModule,
    CommonModule,
    AppHealthModule,
  ],
})
export class AppModule {}

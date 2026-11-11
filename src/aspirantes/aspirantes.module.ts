import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aspirante } from './entities/aspirante.entity';
import { AspirantesController } from './aspirantes.controller';
import { AspirantesService } from './aspirantes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Aspirante])],
  controllers: [AspirantesController],
  providers: [AspirantesService],
  exports: [AspirantesService],
})
export class AspirantesModule {}

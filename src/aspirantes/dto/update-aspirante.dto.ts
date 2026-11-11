import { PartialType } from '@nestjs/swagger';
import { CreateAspiranteDto } from './create-aspirante.dto';

export class UpdateAspiranteDto extends PartialType(CreateAspiranteDto) {}

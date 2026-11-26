import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { Rol } from '../src/auth/entities/rol.entity';
import { Usuario } from '../src/auth/entities/usuario.entity';
import { Role } from '../src/common/enums/roles.enum';
import { Solicitud } from '../src/solicitudes/entities/solicitud.entity';

function askSecret(label: string): Promise<string> {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Ejecuta este comando en una terminal interactiva para ocultar la contraseña.');
  }

  return new Promise((resolve, reject) => {
    let value = '';
    stdout.write(label);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const finish = (error?: Error) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off('data', onData);
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === '\u0003') {
          finish(new Error('Operación cancelada.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
          stdout.write('\b \b');
        } else if (character >= ' ') {
          value += character;
          stdout.write('*');
        }
      }
    };

    stdin.on('data', onData);
  });
}

async function main(): Promise<void> {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter((key) => process.env[key] === undefined);
  if (missing.length) {
    throw new Error(`Faltan variables de base de datos en .env: ${missing.join(', ')}`);
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  const correo = (await prompt.question('Correo del administrador inicial: ')).trim().toLowerCase();
  prompt.close();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 150) {
    throw new Error('Ingresa un correo válido de hasta 150 caracteres.');
  }

  const contrasena = await askSecret('Contraseña (mínimo 9 caracteres): ');
  const confirmacion = await askSecret('Repite la contraseña: ');
  if (contrasena !== confirmacion) throw new Error('Las contraseñas no coinciden.');
  if (contrasena.length < 9 || Buffer.byteLength(contrasena, 'utf8') > 72) {
    throw new Error('La contraseña debe tener al menos 9 caracteres y máximo 72 bytes UTF-8.');
  }

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Usuario, Rol, Solicitud],
    synchronize: false,
  });

  await dataSource.initialize();
  const runner = dataSource.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  try {
    const adminRole = await runner.manager.getRepository(Rol)
      .createQueryBuilder('rol')
      .setLock('pessimistic_write')
      .where('rol.nombre = :nombre', { nombre: Role.ADMIN_SISTEMA })
      .getOne();
    if (!adminRole) {
      throw new Error('No se encontró el rol ADMIN_SISTEMA. Ejecuta primero database/schema/009_create_auth.sql.');
    }

    const existingAdmin = await runner.manager.getRepository(Usuario)
      .createQueryBuilder('usuario')
      .innerJoin('usuario.roles', 'rol')
      .where('rol.id = :roleId', { roleId: adminRole.id })
      .getCount();
    if (existingAdmin > 0) {
      throw new Error('Ya existe un administrador del sistema; no se creó ninguna cuenta.');
    }

    const passwordHash = await hash(contrasena, 12);
    const usuario = runner.manager.getRepository(Usuario).create({
      correo,
      passwordHash,
      roles: [adminRole],
    });
    const created = await runner.manager.getRepository(Usuario).save(usuario);
    await runner.commitTransaction();
    stdout.write(`Administrador inicial creado: ${created.correo}\n`);
  } catch (error) {
    await runner.rollbackTransaction();
    throw error;
  } finally {
    await runner.release();
    await dataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Error desconocido';
  console.error(`No se pudo crear el administrador inicial: ${message}`);
  process.exitCode = 1;
});

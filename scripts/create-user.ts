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
    throw new Error('Ejecuta el comando desde una terminal interactiva para ocultar la contraseña.');
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
        if (character === '\u0003') return finish(new Error('Operación cancelada.'));
        if (character === '\r' || character === '\n') return finish();
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
  if (missing.length) throw new Error(`Faltan variables de base de datos: ${missing.join(', ')}`);

  const prompt = createInterface({ input: stdin, output: stdout });
  const numeroDocumento = (await prompt.question('Identificador/documento: ')).trim();
  const correo = (await prompt.question('Correo: ')).trim().toLowerCase();
  const roleInput = (await prompt.question(`Rol (${Object.values(Role).join(', ')}): `)).trim();
  prompt.close();

  if (!numeroDocumento || numeroDocumento.length > 30) throw new Error('El identificador debe tener entre 1 y 30 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 150) throw new Error('Ingresa un correo válido.');
  if (!Object.values(Role).includes(roleInput as Role)) throw new Error('El rol indicado no existe.');

  const password = await askSecret('Contraseña (mínimo 9 caracteres): ');
  const confirmation = await askSecret('Repite la contraseña: ');
  if (password !== confirmation) throw new Error('Las contraseñas no coinciden.');
  if (password.length < 9 || Buffer.byteLength(password, 'utf8') > 72) {
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
  try {
    await dataSource.transaction(async (manager) => {
      const usuarios = manager.getRepository(Usuario);
      const existing = await usuarios.findOne({
        where: [{ correo }, { numeroDocumento }],
      });
      if (existing) throw new Error('Ya existe una cuenta con ese correo o identificador.');
      const role = await manager.getRepository(Rol).findOne({ where: { nombre: roleInput as Role } });
      if (!role) throw new Error('No se encontró el rol. Ejecuta primero la migración 009.');
      const usuario = usuarios.create({
        correo,
        numeroDocumento,
        passwordHash: await hash(password, 12),
        activo: true,
        tokenVersion: 0,
        solicitud: null,
        roles: [role],
      });
      await usuarios.save(usuario);
    });
    stdout.write(`Cuenta creada para ${correo} con rol ${roleInput}.\n`);
  } finally {
    await dataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Error desconocido';
  console.error(`No se pudo crear la cuenta: ${message}`);
  process.exitCode = 1;
});

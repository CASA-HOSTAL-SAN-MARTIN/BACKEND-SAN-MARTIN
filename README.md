# 🏠 Casa Estudiantil San Martín — Backend

API REST del sistema de gestión de la **Casa Estudiantil San Martín**. Centraliza el control de aspirantes, residentes, asignación de camas, contratos, pagos, becas, inventario, mantenimiento, incidentes y visitas.

> Este repositorio contiene **solo el backend**. La interfaz de usuario está en el repositorio de frontend de la misma organización.

---

## 📌 Descripción

La Casa Estudiantil San Martín es una residencia universitaria mixta ubicada en la Carrera 12 # 21-45, barrio Centro de Pereira, para estudiantes de pregrado (principalmente foráneos) vinculada a la Universidad del Otún a través de su oficina de Bienestar Universitario. El inmueble pertenece a la Fundación San Martín de Porres. Cuenta con tres pisos y un sótano de lavado, con **24 habitaciones dobles y 48 camas**. Por reglamento, el piso 1 es para mujeres, el piso 2 para hombres y el piso 3 para casos especiales. Hay 3 cupos de beca de alojamiento pagados por la Universidad.

la operación es manual y fragmentada: **dos listas de Excel que no coinciden** (`Camas_Fundacion.xlsx` y `Espera_Bienestar.xlsx`), solicitudes por Google Forms y WhatsApp, pagos a una cuenta personal, reportes de daños en chats y libretas, y visitas en un cuaderno. Esa falta de una "verdad única" ya causó incidentes, como la **doble asignación de la cama 1-A** (enero de 2026) y disputas por daños que no tenían evidencia fotográfica.

## 🎯 Propósito

- Digitalizar y centralizar la administración de la casa estudiantil.
- Garantizar que las reglas de negocio se cumplan siempre (género por piso, cama disponible, autorización de menores, tope de reparaciones, etc.).
- Dar trazabilidad completa: quién hizo qué y cuándo (auditoría).
- Reducir errores, pérdidas de información y tiempos de gestión.

## 🧭 Alcance

**Incluye**
- Autenticación, roles y permisos.
- Solicitudes de ingreso, lista de espera y priorización de aspirantes.
- Gestión de residentes y acudientes (con autorización para menores de edad).
- Estructura física: pisos, habitaciones y camas, con estado de cada cama (disponible, ocupada, bloqueada).
- Asignación de camas y su historial, incluyendo el receso intersemestral.
- Contratos y liquidación del depósito.
- Pagos (con comprobante), becas y su conciliación.
- Inventario de entrada y salida (check-in / check-out) con evidencia fotográfica y firma digital.
- Reportes de mantenimiento con estados, prioridad y autorización de gastos mayores.
- Registro de incidentes y de visitas.
- Historial de auditoría y reportes administrativos.

**No incluye**
- Pasarela de pagos en línea (los pagos se registran con su comprobante).
- Aplicación móvil nativa.
- Módulos ajenos a la operación de la casa (nómina, contabilidad general de la institución).

## 👥 Actores del sistema

| Rol | Responsabilidad principal |
|---|---|
| Administrador del sistema | Crea usuarios, asigna roles y permisos, soporte técnico de primer nivel |
| Coordinación de Bienestar (Patricia Rincón) | Selección de aspirantes, convivencia, becas y reportes |
| Administración de la Fundación (Jorge Medina) | Contratos, cartera y autorización de reparaciones mayores |
| Monitora (Camila Restrepo) | Check-in, check-out, rondas, convivencia e incidentes |
| Técnico de mantenimiento (Álvaro Gómez) | Atiende y actualiza los reportes de daños |
| Portería nocturna (Don Raúl) | Control de acceso y registro de visitas |
| Contabilidad de la Fundación (Yolanda) | Cierre contable de ingresos y egresos |
| Aspirante / Residente | Solicitud de cupo, consulta de su cama, contrato y pagos, reporte de daños |
| Acudiente | Pagador y responsable legal; autoriza la estancia de menores |

## 📏 Reglas de negocio principales

- Un usuario puede tener más de un rol (relación muchos a muchos).
- Un piso tiene un género asignado (femenino, masculino o mixto); no se puede asignar una cama que lo incumpla.
- Una cama solo puede estar asignada a un residente a la vez; una cama bloqueada no se puede asignar.
- Una cama no puede quedar doblemente asignada: la asignación se hace con bloqueo transaccional.
- Los menores de edad requieren autorización del acudiente para firmar contrato.
- Las reparaciones por encima de **$80.000** requieren autorización del administrador de la Fundación antes de ejecutarse.
- Todo cambio relevante queda en el historial de auditoría.
- Las fotos y comprobantes se guardan en almacenamiento externo; en la base de datos solo se guarda la URL.

## 🗂️ Modelo de datos

Entidades: `ROL`, `USUARIO`, `HISTORIAL_AUDITORÍA`, `ACUDIENTE`, `ASPIRANTE`, `ESTUDIANTE_RESIDENTE`, `PISO`, `HABITACIÓN`, `CAMA`, `ASIGNACIÓN_CAMA`, `CONTRATO`, `BECA`, `PAGO`, `INVENTARIO`, `FOTO_INVENTARIO`, `REPORTE_MANTENIMIENTO`, `REGISTRO_INCIDENTES` y `REGISTRO_VISITAS`.

El diagrama entidad-relación completo está en `docs/mer_casa_estudiantil_final.png`.

Campos con valores fijos (ENUM): estado de cama, concepto y método de pago, estado de pago, estado y prioridad de reportes, tipo de registro de inventario, tipo de asignación, estado del depósito, estado de conciliación de becas, género del piso, estado de solicitud y operación de auditoría.

## 🛠️ Tecnologías

Definidas en el SRS (RNF-09):

- **Lenguaje y entorno:** Node.js + TypeScript
- **Framework:** NestJS (arquitectura modular en capas)
- **Base de datos:** MySQL
- **Autenticación:** JWT
- **Almacenamiento de archivos:** servicio externo de objetos (S3 / Cloudflare R2)
- **Documentación de la API:** Swagger / OpenAPI

## 🏗️ Arquitectura

API REST por capas: controladores → servicios → repositorios/ORM → base de datos. Cada módulo (usuarios, camas, pagos, inventario, etc.) es independiente y expone sus propios endpoints. La autorización se aplica por rol en cada ruta.

```
src/
├── auth/            # login, JWT, guards por rol
├── usuarios/
├── aspirantes/
├── residentes/
├── alojamiento/     # pisos, habitaciones, camas, asignaciones
├── contratos/
├── pagos/           # pagos y becas
├── inventario/
├── mantenimiento/
├── incidentes/
├── visitas/
├── auditoria/
└── common/          # enums, filtros, utilidades
```

## 🚀 Instalación y ejecución

**Requisitos:** Node.js 18+, npm y una base de datos MySQL en ejecución.

```bash
# 1. Clonar el repositorio
git clone <URL-del-repositorio-backend>
cd <carpeta-del-repositorio>

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Ejecutar en desarrollo
npm run start:dev
```

La API queda disponible en `http://localhost:3000` y la documentación en `http://localhost:3000/api/docs`.

### Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a la base de datos |
| `JWT_SECRET` | Clave para firmar los tokens |
| `JWT_EXPIRES_IN` | Duración del token |
| `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_ENDPOINT` | Almacenamiento externo de archivos |

> ⚠️ Nunca subas el archivo `.env` al repositorio.

### Scripts

| Comando | Acción |
|---|---|
| `npm run start:dev` | Servidor en modo desarrollo |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Ejecutar la versión compilada |
| `npm run test` | Pruebas unitarias |
| `npm run lint` | Revisar el estilo del código |

## 🔒 Seguridad

- Contraseñas almacenadas con hash (nunca en texto plano).
- Acceso por roles y permisos en cada endpoint.
- Validación de datos de entrada.
- Auditoría de operaciones de creación, modificación y eliminación.
- Copias de seguridad periódicas de la base de datos.

## 🤝 Flujo de trabajo del equipo

- Rama principal: `main` (protegida). Desarrollo en `develop`.
- Cada tarea en una rama propia: `feature/nombre-corto` o `fix/nombre-corto`.
- Commits claros y en presente (por ejemplo: `feat: agrega bloqueo de cama`).
- Todo cambio entra a `develop` mediante *Pull Request* revisado por al menos un compañero.

## 👨‍💻 Equipo de Backend

**Equipo Los Insanidi**

- Jonier Rendon Chamorro
- Jamilton Jhony Rueda Legarda
- Jaider Candelo

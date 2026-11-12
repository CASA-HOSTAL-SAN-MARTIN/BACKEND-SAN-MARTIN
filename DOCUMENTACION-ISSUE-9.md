# Issue funcional 2 — Gestión de Información de Aspirantes

**Referencia:** GitHub #9 · Casa Estudiantil San Martín
**Estado de este documento:** implementación local de Aspirantes y decisiones técnicas provisionales, pendientes de revisión y aprobación.

## 1. Objetivo y alcance

La Issue #9 solicita gestionar la información personal, académica y socioeconómica de los aspirantes: registrarla, consultarla, actualizarla y validar los datos recibidos. Propone tres operaciones: crear, consultar por identificador y actualizar.

El alcance no define un listado general, la gestión de la lista de espera ni los campos socioeconómicos concretos. Esos aspectos no se consideran requisitos confirmados de esta Issue.

## 2. Requisitos y estado

| Tema | Requisito confirmado | Estado actual / observación |
|---|---|---|
| Issue #9 | Registrar, consultar y actualizar información personal, académica y socioeconómica; validar los datos recibidos. | Implementadas localmente las tres operaciones para los campos definidos aquí. No se implementan campos socioeconómicos porque no están especificados. |
| RF-02 | El análisis previo del SRS confirmó que requiere edad y detectar automáticamente a las personas menores de 18 años. | `edad` se almacena como entero y la respuesta incluye `esMenorDeEdad`, calculado con `edad < 18`. El documento original del SRS no está disponible en este checkout. |
| DER — ASPIRANTE | Define `id`, `nombre_completo`, `num_doc`, `programa` y `promedio`. | Implementado localmente como entidad TypeORM; las propiedades de aplicación usan camelCase y las columnas SQL snake_case cuando corresponde. |
| Información socioeconómica | RF-02 la exige. | El DER y la información disponible no especifican campos; no se proponen campos inventados. |
| RF/requisitos relacionados | La Issue #9 y los detalles de RF-02, contrastados mediante el análisis previo del SRS, son la base de este borrador. | El documento original del SRS no está disponible en este checkout; se requiere consultarlo para verificar requisitos relacionados y sus reglas exactas. |

## 3. Solicitud y Aspirante

La entidad existente `Solicitud` (`src/solicitudes/entities/solicitud.entity.ts`) representa una solicitud de cupo e incluye:

- `id` (UUID)
- `nombres`, `apellidos`
- `numeroDocumento` (único)
- `correo`, `telefono`
- `programaAcademico`, `universidad`
- `estado` (`pendiente`, `en_revision`, `aprobada`, `rechazada` o `cancelada`)
- `createdAt`, `updatedAt`

| Aspecto | Solicitud existente | Aspirante según DER/RF-02 |
|---|---|---|
| Propósito | Registrar y consultar el trámite de solicitud de cupo. | Gestionar el perfil de información personal, académica y socioeconómica. |
| Datos que se solapan | Nombres/apellidos, documento y programa académico. | Nombre completo, número de documento y programa. |
| Datos adicionales | Correo, teléfono, universidad y estado de la solicitud. | Promedio; RF-02 también requiere edad. |
| Datos no definidos | — | Campos socioeconómicos aún no especificados. |

**Propuesta para revisión:** mantener separados el trámite y el perfil. No copiar automáticamente los campos solapados ni establecer una relación entre las entidades hasta que el profesor confirme cuál es la fuente de verdad y si se requiere vincularlas. El DER proporcionado no especifica esa relación.

## 4. Endpoints de la Issue #9

Los siguientes endpoints aparecen en la descripción de la Issue #9 y están implementados localmente:

| Método y ruta | Propósito | Estado |
|---|---|---|
| `POST /api/aspirantes` | Registrar información de un aspirante. | Implementado localmente. |
| `GET /api/aspirantes/:id` | Consultar un aspirante por identificador. | Implementado localmente. |
| `PUT /api/aspirantes/:id` | Actualizar información de un aspirante. | Implementado localmente; provisionalmente requiere todos los campos del perfil. |

Los campos aceptados se limitan a los definidos para el perfil en esta implementación provisional. `PUT` requiere el conjunto completo de campos; esta decisión técnica queda pendiente de aprobación. Las verificaciones HTTP con repositorio en memoria y las pruebas posteriores contra MySQL real se distinguen en la sección siguiente.

## 5. Implementación NestJS y pruebas

El módulo `src/aspirantes/` contiene:

```text
src/aspirantes/
  aspirantes.module.ts
  aspirantes.controller.ts
  aspirantes.service.ts
  entities/aspirante.entity.ts
  dto/aspirante-response.dto.ts
  dto/create-aspirante.dto.ts
  dto/update-aspirante.dto.ts

test/issue-2/
  aspirantes.controller.spec.ts
  aspirantes.dto.spec.ts
  aspirantes.service.spec.ts

database/schema/
  002_create_aspirantes.sql
```

Los DTOs validan texto no vacío, promedio numérico y edad entera, sin imponer longitudes, rangos para promedio ni unicidad de `num_doc`. Transforman los campos de texto para recortar espacios al inicio y al final; si el valor contiene solo espacios, queda vacío y la validación lo rechaza. Esto aplica tanto a creación como a actualización.

La aplicación instala en `src/main.ts` un `ValidationPipe` global con `whitelist: true` y `transform: true`. Una comprobación HTTP temporal con Nest y un repositorio en memoria verificó que el pipe se aplica a POST y PUT: valores con solo espacios respondieron 400, los textos válidos se recortaron y una actualización válida respondió 200. Esta comprobación no utilizó MySQL. Las pruebas automatizadas unitarias tampoco levantan la aplicación ni MySQL.

**Pruebas de integración HTTP contra MySQL real:** se realizaron en la base aislada `db_san_martin_issue9_test`. El POST fue exitoso y se confirmó que el registro quedó guardado; el GET por ID fue exitoso; el PUT fue exitoso y los cambios se verificaron directamente en HeidiSQL. Estas pruebas son independientes de la comprobación HTTP con repositorio en memoria descrita arriba.

**Verificaciones reportadas:** 16 pruebas unitarias de Issue #9 aprobadas; `npm run build` exitoso; ESLint focalizado exitoso. La comprobación HTTP temporal con repositorio en memoria verificó POST 201, PUT 200, edad 17 como menor, edad 18 como no menor, UUID inválido 400, registro inexistente 404 y rechazo de valores de texto compuestos solo por espacios. Por separado, las pruebas HTTP contra MySQL real confirmaron POST, GET por ID y PUT en la base aislada indicada.

**Decisiones técnicas provisionales:** `PUT` reemplaza los campos editables del perfil y por ello exige el conjunto completo; `esMenorDeEdad` se calcula en la respuesta y no se persiste; los campos de texto usan `TEXT` para no introducir longitudes no especificadas y el promedio se almacena como `DOUBLE` sin rango impuesto. La edad se representa como entero, decisión provisional que requiere confirmación del profesor. El esquema manual está en `database/schema/002_create_aspirantes.sql`; la tabla `aspirantes` se creó manualmente porque `synchronize` está desactivado. El SQL aún no se ha aplicado a la base de datos compartida del proyecto. No se añade unicidad a `num_doc` ni relación con otras entidades.

## 6. Límites entre Issues

- **Issue #8 — Jonier:** `SolicitudesModule` ya existe con entidad, DTO, controlador, servicio y pruebas unitarias en `test/issue-1/`. La entidad y sus datos se describen arriba. La Issue #8 incluye registro y consultas de solicitudes; no debe modificarse como parte de la #9 sin coordinación y aprobación.
- **Issue #9 — Jamilton:** responsabilidad asignada: gestión del perfil de Aspirante y las tres operaciones definidas por la Issue. La implementación local no crea ni modifica Solicitudes, Usuarios, Acudientes o la Lista de Espera.
- **Issue #10 — Candelo:** responsabilidad separada: lógica de lista de espera. Como propuesta de integración, Candelo podría referenciar un identificador de aspirante en lugar de duplicar sus datos, pero el contrato, las relaciones y la propiedad de los estados requieren acuerdo entre el equipo. Este documento no diseña ni implementa la lista de espera.

## 7. Decisiones para aprobación del profesor

1. ¿Qué campos socioeconómicos exige RF-02 y cuáles son obligatorios? Los campos no están definidos en el SRS/DER disponible y requieren aclaración del profesor.
2. ¿Se almacena edad o fecha de nacimiento para detectar menores de 18? ¿Qué comportamiento funcional requiere esa detección? La representación actual de edad como entero es provisional y requiere confirmación.
3. ¿Cuál es la escala, precisión y rango válido de `promedio`?
4. ¿Cómo se relacionan Solicitud y Aspirante, si deben relacionarse? ¿Cuál entidad es fuente de verdad para nombre, documento y programa?
5. ¿`PUT` debe recibir el perfil completo o se requiere una actualización parcial?
6. ¿Qué roles pueden consultar y actualizar la información personal y socioeconómica?
7. ¿Qué campos necesita Candelo para la lista de espera y cómo consumirá los datos de Aspirantes?
8. ¿`num_doc` debe ser único en Aspirante y cómo se identifica un registro duplicado?

Hasta obtener estas respuestas y revisar el SRS completo, los campos socioeconómicos, la relación entre entidades y las reglas no especificadas permanecen pendientes.

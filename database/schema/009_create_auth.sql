CREATE TABLE IF NOT EXISTS roles (
  id varchar(36) NOT NULL,
  nombre enum(
    'ADMIN_SISTEMA', 'COORDINACION_BIENESTAR', 'ADMIN_FUNDACION',
    'MONITORA', 'TECNICO_MANTENIMIENTO', 'PORTERIA', 'CONTABILIDAD',
    'ASPIRANTE_RESIDENTE', 'ACUDIENTE'
  ) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id varchar(36) NOT NULL,
  correo varchar(150) NOT NULL,
  password_hash varchar(60) NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  token_version int NOT NULL DEFAULT 0,
  created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios_roles (
  usuario_id varchar(36) NOT NULL,
  rol_id varchar(36) NOT NULL,
  PRIMARY KEY (usuario_id, rol_id),
  CONSTRAINT fk_usuarios_roles_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_usuarios_roles_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO roles (id, nombre) VALUES
  (UUID(), 'ADMIN_SISTEMA'),
  (UUID(), 'COORDINACION_BIENESTAR'),
  (UUID(), 'ADMIN_FUNDACION'),
  (UUID(), 'MONITORA'),
  (UUID(), 'TECNICO_MANTENIMIENTO'),
  (UUID(), 'PORTERIA'),
  (UUID(), 'CONTABILIDAD'),
  (UUID(), 'ASPIRANTE_RESIDENTE'),
  (UUID(), 'ACUDIENTE');

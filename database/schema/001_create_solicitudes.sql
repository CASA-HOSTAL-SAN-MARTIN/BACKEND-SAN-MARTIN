CREATE TABLE IF NOT EXISTS solicitudes (
  id varchar(36) NOT NULL,
  nombres varchar(100) NOT NULL,
  apellidos varchar(100) NOT NULL,
  numero_documento varchar(30) NOT NULL,
  correo varchar(150) NOT NULL,
  telefono varchar(30) NOT NULL,
  programa_academico varchar(150) NOT NULL,
  universidad varchar(150) NOT NULL,
  estado enum('pendiente', 'en_revision', 'aprobada', 'rechazada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_solicitudes_numero_documento (numero_documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

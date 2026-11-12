CREATE TABLE IF NOT EXISTS asignaciones_cama (
  id varchar(36) NOT NULL,
  estudiante_id varchar(36) NOT NULL,
  cama_id varchar(36) NOT NULL,
  fecha_asignacion datetime(6) NOT NULL,
  fecha_finalizacion datetime(6) NULL,
  created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_asignaciones_cama_fecha (cama_id, fecha_asignacion),
  KEY idx_asignaciones_estudiante (estudiante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

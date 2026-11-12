CREATE TABLE IF NOT EXISTS contratos (
  id varchar(36) NOT NULL,
  residente_id varchar(36) NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NULL,
  valor_mensual int unsigned NULL,
  estado enum('activo', 'finalizado', 'cancelado') NOT NULL DEFAULT 'activo',
  observaciones varchar(500) NULL,
  created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_contratos_residente_fecha (residente_id, fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

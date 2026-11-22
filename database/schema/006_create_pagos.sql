CREATE TABLE IF NOT EXISTS pagos (
  id varchar(36) NOT NULL,
  residente_id varchar(36) NOT NULL,
  tipo enum('mensualidad', 'deposito') NOT NULL DEFAULT 'mensualidad',
  monto int unsigned NOT NULL,
  fecha_pago date NOT NULL,
  metodo_pago enum('transferencia', 'consignacion', 'efectivo', 'otro') NOT NULL DEFAULT 'transferencia',
  referencia varchar(100) NULL,
  observaciones varchar(500) NULL,
  created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_pagos_residente (residente_id),
  KEY idx_pagos_tipo (tipo),
  KEY idx_pagos_fecha (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

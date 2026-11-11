CREATE TABLE IF NOT EXISTS lista_espera (
  id varchar(36) NOT NULL,
  aspirante_id varchar(36) NOT NULL,
  estado enum('pendiente', 'asignado', 'retirado') NOT NULL DEFAULT 'pendiente',
  created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_lista_espera_aspirante (aspirante_id),
  CONSTRAINT fk_lista_espera_aspirante
    FOREIGN KEY (aspirante_id) REFERENCES aspirantes (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

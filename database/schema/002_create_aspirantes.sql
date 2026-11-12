CREATE TABLE IF NOT EXISTS aspirantes (
  id varchar(36) NOT NULL,
  nombre_completo text NOT NULL,
  num_doc text NOT NULL,
  programa text NOT NULL,
  promedio double NOT NULL,
  edad int NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

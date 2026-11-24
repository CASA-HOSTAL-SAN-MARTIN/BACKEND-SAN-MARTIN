SET @migration_sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'asignaciones_cama'
      AND COLUMN_NAME = 'cama_activa_id'
  ) = 0,
  'ALTER TABLE asignaciones_cama ADD COLUMN cama_activa_id varchar(36) GENERATED ALWAYS AS (CASE WHEN fecha_finalizacion IS NULL THEN cama_id ELSE NULL END) STORED',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'asignaciones_cama'
      AND INDEX_NAME = 'uq_asignaciones_cama_activa'
  ) = 0,
  'ALTER TABLE asignaciones_cama ADD UNIQUE KEY uq_asignaciones_cama_activa (cama_activa_id)',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'asignaciones_cama'
      AND CONSTRAINT_NAME = 'fk_asignaciones_cama_cama'
  ) = 0,
  'ALTER TABLE asignaciones_cama ADD CONSTRAINT fk_asignaciones_cama_cama FOREIGN KEY (cama_id) REFERENCES camas (id) ON UPDATE CASCADE ON DELETE RESTRICT',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

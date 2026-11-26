ALTER TABLE solicitudes
  ADD COLUMN radicado varchar(18) NULL AFTER id;

UPDATE solicitudes
SET radicado = CONCAT(
  'SM-',
  YEAR(created_at),
  '-',
  UPPER(SUBSTRING(REPLACE(id, '-', ''), 1, 10))
)
WHERE radicado IS NULL;

ALTER TABLE solicitudes
  MODIFY COLUMN radicado varchar(18) NOT NULL,
  ADD UNIQUE KEY uq_solicitudes_radicado (radicado);

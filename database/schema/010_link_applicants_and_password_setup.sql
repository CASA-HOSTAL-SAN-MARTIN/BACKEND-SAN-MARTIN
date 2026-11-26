ALTER TABLE usuarios
  MODIFY COLUMN password_hash varchar(60) NULL,
  ADD COLUMN numero_documento varchar(30) NULL AFTER correo,
  ADD COLUMN password_setup_token_hash char(64) NULL,
  ADD COLUMN password_setup_token_expires_at datetime(6) NULL,
  ADD COLUMN solicitud_id varchar(36) NULL,
  ADD UNIQUE KEY uq_usuarios_numero_documento (numero_documento),
  ADD UNIQUE KEY uq_usuarios_solicitud (solicitud_id),
  ADD CONSTRAINT fk_usuarios_solicitud FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes(id) ON DELETE SET NULL;

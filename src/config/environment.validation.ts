export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const missing = required.filter((key) => config[key] === undefined);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const port = Number(config.PORT ?? 3000);
  const databasePort = Number(config.DB_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535');
  }

  return { ...config, PORT: port, DB_PORT: databasePort };
}

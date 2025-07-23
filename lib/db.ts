import mysql from 'mysql2/promise';

const dbConfig = {
  cartagena: {
    host: process.env.DB_CARTAGENA_HOST,
    user: process.env.DB_CARTAGENA_USER,
    password: process.env.DB_CARTAGENA_PASSWORD,
    database: process.env.DB_CARTAGENA_DATABASE,
    port: process.env.DB_CARTAGENA_PORT,
  },
  barranquilla: {
    host: process.env.DB_BARRANQUILLA_HOST,
    user: process.env.DB_BARRANQUILLA_USER,
    password: process.env.DB_BARRANQUILLA_PASSWORD,
    database: process.env.DB_BARRANQUILLA_DATABASE,
    port: process.env.DB_BARRANQUILLA_PORT,
  },
  Argos: {
    host: process.env.DB_CEMENTOSARGOS_HOST,
    user: process.env.DB_CEMENTOSARGOS_USER,
    password: process.env.DB_CEMENTOSARGOS_PASSWORD,
    database: process.env.DB_CEMENTOSARGOS_DATABASE,
    port: process.env.DB_CEMENTOSARGOS_PORT,
  },
};

export async function getConnection(dbName: keyof typeof dbConfig) {
  const config = dbConfig[dbName];
  if (!config) throw new Error('Base de datos no configurada');
  // Convert port to number if it's a string
  const fixedConfig = {
    ...config,
    port: config.port ? Number(config.port) : undefined,
  };
  return await mysql.createConnection(fixedConfig);
}
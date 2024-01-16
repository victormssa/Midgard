import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import autoload from '@fastify/autoload';

import { db, runMigrations } from './database/db';

const serverOptions = {
  logger: true,
};

// Configurações do CORS
const corsOptions = {
  origin: true, // Habilitar todas as origens
  credentials: true, // Habilitar credenciais de CORS
};

async function setupServer() {
  const server: FastifyInstance = fastify(serverOptions);

  // Registro de plugins
  try {
    await server.register(fastifyCors, corsOptions);
    server.log.info('Cors plugin registered successfully');
  } catch (err) {
    server.log.error(`Error registering Cors plugin: ${err}`);
  }

  try {
    await server.register(fastifySensible);
    server.log.info('Sensible plugin registered successfully');
  } catch (err) {
    server.log.error(`Error registering Sensible plugin: ${err}`);
  }

  try {
    await server.register(autoload, {
      dir: `${__dirname}/routes`,
    });
    server.log.info('Autoload plugin (routes) registered successfully');
  } catch (err) {
    server.log.error(`Error registering Autoload plugin (routes): ${err}`);
  }

  return server;
}

// Função para iniciar o servidor
const start = async () => {
  try {
    // Inicializar a conexão com o banco de dados
    await db.connect();

    // Verificar se a tabela 'users' existe e rodar migrações se necessário
    await runMigrations();

    // Configurar o servidor
    const server = await setupServer();

    // Iniciar o servidor e ouvir na porta 3001
    await server.listen({ port: 3001, host: '0.0.0.0' });

    const serverAddress = server.server.address();
    if (typeof serverAddress === 'string') {
      server.log.info(`Server listening at ${serverAddress}`);
    } else if (serverAddress) {
      server.log.info(`Server listening at ${serverAddress.address}:${serverAddress.port}`);
    } else {
      server.log.warn(`Unable to determine server address and port`);
    }
  } catch (err) {
    console.error(`Error starting server: ${err}`);
    process.exit(1);
  }
};

// Iniciar o servidor
start();

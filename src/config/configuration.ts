import * as dotenv from 'dotenv';

dotenv.config();

export default {
  databaseConfig: {
    db_host: process.env.DATABASE_HOST,
    db_name: process.env.DATABASE,
    db_username: process.env.DATABASE_USERNAME,
    db_password: process.env.DATABASE_PASSWORD,
    db_synchronize: process.env.SYNCHRONIZE,
    db_ssl: process.env.DATABASE_SSL,
  },
  appConfig: {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
  },
  escrowConfig: {
    apiKey: process.env.API_KEY,
    applicationId: process.env.APPLICATION_ID,
    network: process.env.ESCROW_NETWORK,
    environment: process.env.XCROW_ENVIRONMENT,
  },
  platformConfig: {
    platformPublicKey: process.env.PLATFORM_PUBLIC_KEY,
    platformPrivateKey: process.env.PLATFORM_PRIVATE_KEY,
  },
};

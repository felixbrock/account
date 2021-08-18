export const nodeEnv = process.env.NODE_ENV || 'development';
export const defaultPort = 3000;
export const port = process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort;
export const apiRoot = process.env.API_ROOT || "/";
export const appConfig = {
  express: {
    port,
    mode: nodeEnv
  },
  mongodb: {
    url: process.env.DATABASE_URL || '',
    dbName: process.env.DATABASE_NAME || ''
  }
};

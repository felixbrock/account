const nodeEnv = process.env.NODE_ENV || 'development';
const defaultPort = 8081;
const port = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : defaultPort;
const apiRoot = process.env.API_ROOT || 'api';

const getServiceDiscoveryNamespace = (): string => {
  switch (nodeEnv) {
    case 'test':
      return 'account-staging';
    case 'production':
      return 'account';
    default:
      throw new Error('No valid nodenv value provided');
  }
};

export interface MongoDbConfig {
  url: string;
  dbName: string;
}

const getMongodbConfig = (): MongoDbConfig => {
  switch (nodeEnv) {
    case 'development':
      return {
        url: process.env.DATABASE_DEV_URL || '',
        dbName: process.env.DATABASE_DEV_NAME || '',
      };
    case 'test':
      return {
        url: process.env.DATABASE_TEST_URL || '',
        dbName: process.env.DATABASE_TEST_NAME || '',
      };
    case 'production':
      return {
        url: process.env.DATABASE_URL || '',
        dbName: process.env.DATABASE_NAME || '',
      };
    default:
      return {
        url: '',
        dbName: '',
      };
  }
};

const getCognitoUserPoolId = (): string => {
  switch (nodeEnv) {
    case 'development':
      return 'eu-central-1_HYLD4MoTL';
    case 'test':
      return 'eu-central-1_htA4V0E1g';
    case 'production':
      return 'eu-central-1_fttc090sQ';
    default:
      throw new Error('No valid nodenv provided');
  }
};

export const appConfig = {
  express: {
    port,
    mode: nodeEnv,
    apiRoot
  },
  cloud: {
    serviceDiscoveryNamespace: getServiceDiscoveryNamespace(),
    userPoolId: getCognitoUserPoolId(),
    region: 'eu-central-1',
  },
  mongodb: {
    ...getMongodbConfig(),
  },
};

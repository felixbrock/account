const dotenv =  require('dotenv');

dotenv.config();

// eslint-disable-next-line import/first
const ExpressApp = require('./dist/infrastructure/api/express-app');
// eslint-disable-next-line import/first
const config = require('./dist/config');

const serverlessExpress = require('@vendia/serverless-express');

const expressApp = new ExpressApp(config.appConfig.express);

expressApp.start();

exports.handler = serverlessExpress({ app: expressApp.start() });

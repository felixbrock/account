const dotenv = require('dotenv');

dotenv.config();

// eslint-disable-next-line import/first
const ExpressApp = require('./dist/infrastructure/api/express-app');
// eslint-disable-next-line import/first
const config = require('./dist/config');

const serverlessExpress = require('serverless-http');

const expressApp = new ExpressApp(config.appConfig.express);

console.log('starting app...');

module.exports.handler = serverlessExpress(expressApp.start());

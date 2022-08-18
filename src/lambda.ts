import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line import/first
import serverlessExpress from 'serverless-http';
// eslint-disable-next-line import/first
import ExpressApp from './infrastructure/api/express-app';
// eslint-disable-next-line import/first
import {appConfig} from './config';


const expressApp = new ExpressApp(appConfig.express);

console.log('starting app...');

module.exports.handler = serverlessExpress(expressApp.start());
// eslint-disable-next-line import/first
import serverlessExpress from 'serverless-http';
// eslint-disable-next-line import/first
import ExpressApp from './infrastructure/api/express-app';
// eslint-disable-next-line import/first
import {appConfig} from './config';


const expressApp = new ExpressApp(appConfig.express);

module.exports.handler = serverlessExpress(expressApp.start());
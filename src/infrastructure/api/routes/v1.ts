import { Router } from 'express';
import { appConfig } from '../../../config';
import accountRoutes from './account-routes';
import accountsRoutes from './accounts-routes';
import organizationRoutes from './organization-routes';

const version = 'v1';

const v1Router = Router();

v1Router.get('/', (req, res) => res.json({ message: "Yo! We're up!" }));

v1Router.use(`/${appConfig.express.apiRoot}/${version}/account`, accountRoutes);

v1Router.use(`/${appConfig.express.apiRoot}/${version}/accounts`, accountsRoutes);

v1Router.use(`/${appConfig.express.apiRoot}/${version}/organization`, organizationRoutes);


export default v1Router;

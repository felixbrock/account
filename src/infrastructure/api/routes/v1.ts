import { Router } from 'express';
import { apiRoot } from '../../../config';
import accountRoutes from './account-routes';
import accountsRoutes from './accounts-routes';
import organizationRoutes from './organization-routes';
import organizationsRoutes from './organizations-routes';

const version = 'v1';

const v1Router = Router();

v1Router.get('/', (req, res) => res.json({ message: "Yo! We're up!" }));

v1Router.use(`/${apiRoot}/${version}/account`, accountRoutes);

v1Router.use(`/${apiRoot}/${version}/accounts`, accountsRoutes);

v1Router.use(`/${apiRoot}/${version}/organization`, organizationRoutes);

v1Router.use(`/${apiRoot}/${version}/organizations`, organizationsRoutes);

export default v1Router;

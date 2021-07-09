import { Router } from 'express';
import { apiRoot } from '../../../config';
import accountRoutes from './account-routes';
import accountsRoutes from './accounts-routes';

const version = 'v1';

const v1Router = Router();

v1Router.get('/', (req, res) => res.json({ message: "Yo! We're up!" }));

v1Router.use(`/${apiRoot}/${version}/account`, accountRoutes);

v1Router.use(`/${apiRoot}/${version}/accounts`, accountsRoutes);

export default v1Router;

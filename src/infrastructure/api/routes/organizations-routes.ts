import { Router } from 'express';
import app from '../../ioc-register';
import ReadOrganizationsController from '../controllers/read-organizations-controller';

const organizationsRoutes = Router();

const dbo = app.resolve('dbo');

const readOrganizationsController = new ReadOrganizationsController(
  app.resolve('readAccounts'),
  app.resolve('readOrganizations'),
  dbo
);

organizationsRoutes.get('/', (req, res) =>
  readOrganizationsController.execute(req, res)
);

export default organizationsRoutes;

import { Router } from 'express';
import app from '../../ioc-register';
import ReadOrganizationsController from '../controllers/read-organizations-controller';

const organizationsRoutes = Router();

const readOrganizationsController = new ReadOrganizationsController(
  app.resolve('readOrganizations'),
  app.resolve('readAccounts')
);

organizationsRoutes.get('/', (req, res) =>
  readOrganizationsController.execute(req, res)
);

export default organizationsRoutes;

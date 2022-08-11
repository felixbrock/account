import { Router } from 'express';
import CreateOrganizationController from '../controllers/create-organization-controller';
import ReadOrganizationController from '../controllers/read-organization-controller';
import app from '../../ioc-register';

const organizationRoutes = Router();

const createOrganization = app.resolve('createOrganization');
const readOrganization = app.resolve('readOrganization');
const readAccounts = app.resolve('readAccounts');

const createOrganizationController = new CreateOrganizationController(
  createOrganization,
  readAccounts
);

const readOrganizationController = new ReadOrganizationController(
  readOrganization,
  readAccounts
);

organizationRoutes.post('/', (req, res) =>
  createOrganizationController.execute(req, res)
);

organizationRoutes.get('/:organizationId', (req, res) =>
  readOrganizationController.execute(req, res)
);

export default organizationRoutes;

import { Router } from 'express';
import CreateOrganizationController from '../controllers/create-organization-controller';
import ReadOrganizationController from '../controllers/read-organization-controller';
import app from '../../ioc-register';
import OrganizationDomain from '../../../domain/account-domain';

const organizationRoutes = Router();

const organizationDomain: OrganizationDomain = app.accountMain;

const createOrganizationController = new CreateOrganizationController(
  organizationDomain.createOrganization
);

const readOrganizationController = new ReadOrganizationController(
  organizationDomain.readOrganization
);

organizationRoutes.post('/', (req, res) =>
  createOrganizationController.execute(req, res)
);

organizationRoutes.get('/:organizationId', (req, res) =>
  readOrganizationController.execute(req, res)
);

export default organizationRoutes;

import { Router } from 'express';
import app from '../../ioc-register';
import OrganizationDomain from '../../../domain/account-domain';
import ReadOrganizationsController from '../controllers/read-organizations-controller';

const organizationsRoutes = Router();
const organizationDomain: OrganizationDomain = app.accountMain;

const readOrganizationsController = new ReadOrganizationsController(
  organizationDomain.readOrganizations
);

organizationsRoutes.get('/', (req, res) =>
readOrganizationsController.execute(req, res)
);

export default organizationsRoutes;

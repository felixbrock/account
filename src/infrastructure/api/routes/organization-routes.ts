import { Router } from 'express';
import CreateOrganizationController from '../controllers/create-organization-controller';
import ReadOrganizationController from '../controllers/read-organization-controller';
import app from '../../ioc-register';
import AccountDomain from '../../../domain/account-domain';

const organizationRoutes = Router();

const accountDomain: AccountDomain = app.accountMain;

const createOrganizationController = new CreateOrganizationController(
  accountDomain.createOrganization,
  accountDomain.readAccounts
);

const readOrganizationController = new ReadOrganizationController(
  accountDomain.readOrganization,
  accountDomain.readAccounts
);

organizationRoutes.post('/', (req, res) =>
  createOrganizationController.execute(req, res)
);

organizationRoutes.get('/:organizationId', (req, res) =>
  readOrganizationController.execute(req, res)
);

export default organizationRoutes;

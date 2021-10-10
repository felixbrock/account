import { Router } from 'express';
import AccountDomain from '../../../domain/account-domain';
import app from '../../ioc-register';
import ReadOrganizationsController from '../controllers/read-organizations-controller';

const organizationsRoutes = Router();
const accountDomain: AccountDomain = app.accountMain;

const readOrganizationsController = new ReadOrganizationsController(
  accountDomain.readOrganizations,
  accountDomain.readAccounts
);

organizationsRoutes.get('/', (req, res) =>
  readOrganizationsController.execute(req, res)
);

export default organizationsRoutes;

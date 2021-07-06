import { Router } from 'express';
import app from '../../ioc-register';
import AccountDomain from '../../../domain/account-domain';
import ReadAccountsController from '../controllers/read-accounts-controller';

const accountsRoutes = Router();
const accountDomain: AccountDomain = app.accountMain;

const readAccountsController = new ReadAccountsController(
  accountDomain.readAccounts
);

accountsRoutes.get('/', (req, res) =>
readAccountsController.execute(req, res)
);

export default accountsRoutes;

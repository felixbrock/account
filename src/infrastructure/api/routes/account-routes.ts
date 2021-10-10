import { Router } from 'express';
import CreateAccountController from '../controllers/create-account-controller';
import ReadAccountController from '../controllers/read-account-controller';
import app from '../../ioc-register';
import AccountDomain from '../../../domain/account-domain';

const accountRoutes = Router();

const accountDomain: AccountDomain = app.accountMain;

const createAccountController = new CreateAccountController(
  accountDomain.createAccount, accountDomain.readAccounts
);

const readAccountController = new ReadAccountController(
  accountDomain.readAccount, accountDomain.readAccounts
);

accountRoutes.post('/', (req, res) =>
  createAccountController.execute(req, res)
);

accountRoutes.get('/:accountId', (req, res) =>
  readAccountController.execute(req, res)
);

export default accountRoutes;

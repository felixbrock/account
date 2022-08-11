import { Router } from 'express';
import CreateAccountController from '../controllers/create-account-controller';
import ReadAccountController from '../controllers/read-account-controller';
import app from '../../ioc-register';

const accountRoutes = Router();


const readAccounts = app.resolve('readAccounts');

const createAccountController = new CreateAccountController(
  app.resolve('createAccount'), readAccounts
);

const readAccountController = new ReadAccountController(
  app.resolve('readAccount'), readAccounts
);

accountRoutes.post('/', (req, res) =>
  createAccountController.execute(req, res)
);

accountRoutes.get('/:accountId', (req, res) =>
  readAccountController.execute(req, res)
);

export default accountRoutes;

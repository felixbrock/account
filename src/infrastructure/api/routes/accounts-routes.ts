import { Router } from 'express';
import app from '../../ioc-register';
import ReadAccountsController from '../controllers/read-accounts-controller';

const accountsRoutes = Router();

const dbo = app.resolve('dbo');

const readAccountsController = new ReadAccountsController(
  app.resolve('readAccounts'), dbo
);

accountsRoutes.get('/', (req, res) =>
readAccountsController.execute(req, res)
);

export default accountsRoutes;

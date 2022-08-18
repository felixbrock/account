import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import iocRegister from '../ioc-register';
import Dbo from '../persistence/db/mongo-db';
import v1Router from './routes/v1';

interface AppConfig {
  port: number;
  mode: string;
}

export default class ExpressApp {
  #expressApp: Application;

  #config: AppConfig;

  constructor(config: AppConfig) {
    this.#expressApp = express();
    this.#config = config;
  }

  start(): Application {
    const dbo: Dbo = iocRegister.resolve('dbo');

    dbo.connectToServer((err: any) => {
      if (err) {
        console.error(err);
        process.exit();
      }

      this.#expressApp.listen(this.#config.port, () => {
        console.log(
          `App running under pid ${process.pid} and listening on port: ${
            this.#config.port
          } in ${this.#config.mode} mode`
        );
      });
    });
    this.configApp();

    return this.#expressApp;
  }

  private configApp(): void {
    this.#expressApp.use(express.json());
    this.#expressApp.use(express.urlencoded({ extended: true }));
    this.#expressApp.use(cors());
    this.#expressApp.use(compression());
    // this.#expressApp.use(morgan("combined"));
    this.#expressApp.use(helmet());
    this.#expressApp.use(v1Router);
  }
}

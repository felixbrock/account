import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import { appConfig } from '../../../config';

export default class Dbo {
  #something = ():void => console.log(appConfig);
  
  #anything = this.#something();

	#client = new MongoClient(appConfig.mongodb.url, {
		serverApi: ServerApiVersion.v1,
	});
	
	#dbConnection: Db | undefined;

	get dbConnection(): Db {
		if(!this.#dbConnection) throw Error('Undefined db connection. Please connect to server first');
		return this.#dbConnection;
	}

	connectToServer = (callback: (err?: unknown) => unknown): any => {
    this.#client.connect((err, db) =>  {
      if (err || !db) {
        return callback(err);
      }

      this.#dbConnection = db.db(appConfig.mongodb.dbName);
      console.log('Successfully connected to MongoDB.');

      return callback();
    });
  };

};
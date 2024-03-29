import { Account } from '../entities/account';
import { DbConnection } from '../services/i-db';

export interface AccountQueryDto {
  userId: string;
  modifiedOnStart?: string;
  modifiedOnEnd?: string;
}

export interface IAccountRepository {
  findOne(id: string, dbConnection: DbConnection): Promise<Account | null>;
  findBy(
    accountQueryDto: AccountQueryDto,
    dbConnection: DbConnection
  ): Promise<Account[]>;
  all(dbConnection: DbConnection): Promise<Account[]>;
  insertOne(account: Account, dbConnection: DbConnection): Promise<string>;
}

import { Db, Document, FindCursor, InsertOneResult, ObjectId } from 'mongodb';
import sanitize from 'mongo-sanitize';
import { Account, AccountProperties } from '../../domain/entities/account';
import {
  AccountQueryDto,
  IAccountRepository,
} from '../../domain/account/i-account-repository';

interface AccountPersistence {
  _id: string;
  userId: string;
  organizationId: string;
  modifiedOn: string;
}

interface AccountQueryFilter {
  userId: string;
  modifiedOn?: { [key: string]: string };
}

const collectionName = 'accounts';

export default class AccountRepositoryImpl implements IAccountRepository {
  public findOne = async (
    id: string,
    dbConnection: Db
  ): Promise<Account | null> => {
    try {
      const result: any = await dbConnection
        .collection(collectionName)
        .findOne({ _id: new ObjectId(sanitize(id)) });

      if (!result) return null;

      return this.#toEntity(this.#buildProperties(result));
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public findBy = async (
    accountQueryDto: AccountQueryDto,
    dbConnection: Db
  ): Promise<Account[]> => {
    try {
      if (!Object.keys(accountQueryDto).length)
        return await this.all(dbConnection);

      const result: FindCursor = await dbConnection
        .collection(collectionName)
        .find(this.#buildFilter(sanitize(accountQueryDto)));
      const results = await result.toArray();

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #buildFilter = (accountQueryDto: AccountQueryDto): AccountQueryFilter => {
    const filter: AccountQueryFilter = {userId: accountQueryDto.userId};

    return filter;
  };

  public all = async (dbConnection: Db): Promise<Account[]> => {
    try {
      const result: FindCursor = await dbConnection
        .collection(collectionName)
        .find();
      const results = await result.toArray();

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public insertOne = async (
    account: Account,
    dbConnection: Db
  ): Promise<string> => {
    try {
      const result: InsertOneResult<Document> = await dbConnection
        .collection(collectionName)
        .insertOne(this.#toPersistence(sanitize(account)));

      if (!result.acknowledged)
        throw new Error('Account creation failed. Insert not acknowledged');

      return result.insertedId.toHexString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #toEntity = (accountProperties: AccountProperties): Account =>
    Account.create(accountProperties);

  #buildProperties = (account: AccountPersistence): AccountProperties => ({
    // eslint-disable-next-line no-underscore-dangle
    id: account._id,
    userId: account.userId,
    organizationId: account.organizationId,
    modifiedOn: account.modifiedOn,
  });

  #toPersistence = (account: Account): Document => ({
    _id: ObjectId.createFromHexString(account.id),
    userId: account.userId,
    organizationId: account.organizationId,
    modifiedOn: account.modifiedOn,
  });
}

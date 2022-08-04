import { Document, FindCursor, InsertOneResult, ObjectId } from 'mongodb';
import sanitize from 'mongo-sanitize';
import { Account, AccountProperties } from '../../domain/entities/account';
import {
  AccountQueryDto,
  IAccountRepository,
} from '../../domain/account/i-account-repository';
import { close, connect, createClient } from './db/mongo-db';

interface AccountPersistence {
  _id: string;
  userId: string;
  organizationId: string;
  modifiedOn: number;
}

interface AccountQueryFilter {
  userId?: string;
  organizationId?: string;
  modifiedOn?: { [key: string]: number };
}

const collectionName = 'accounts';

export default class AccountRepositoryImpl implements IAccountRepository {
  public findOne = async (id: string): Promise<Account | null> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: any = await db
        .collection(collectionName)
        .findOne({ _id: new ObjectId(sanitize(id)) });

      close(client);

      if (!result) return null;

      return this.#toEntity(this.#buildProperties(result));
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public findBy = async (
    accountQueryDto: AccountQueryDto
  ): Promise<Account[]> => {
    try {
      if (!Object.keys(accountQueryDto).length) return await this.all();

      const client = createClient();
      const db = await connect(client);
      const result: FindCursor = await db
        .collection(collectionName)
        .find(this.#buildFilter(sanitize(accountQueryDto)));
      const results = await result.toArray();

      close(client);

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
    const filter: { [key: string]: any } = {};

    if (accountQueryDto.userId) filter.userId = accountQueryDto.userId;

    if (accountQueryDto.organizationId)
      filter.organizationId = accountQueryDto.organizationId;

    const modifiedOnFilter: { [key: string]: number } = {};
    if (accountQueryDto.modifiedOnStart)
      modifiedOnFilter.$gte = accountQueryDto.modifiedOnStart;
    if (accountQueryDto.modifiedOnEnd)
      modifiedOnFilter.$lte = accountQueryDto.modifiedOnEnd;
    if (Object.keys(modifiedOnFilter).length)
      filter.modifiedOn = modifiedOnFilter;

    return filter;
  };

  public all = async (): Promise<Account[]> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: FindCursor = await db.collection(collectionName).find();
      const results = await result.toArray();

      close(client);

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

  public insertOne = async (account: Account): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(sanitize(account)));

      if (!result.acknowledged)
        throw new Error('Account creation failed. Insert not acknowledged');

      close(client);

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

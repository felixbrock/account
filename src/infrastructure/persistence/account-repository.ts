import { Document, FindCursor, InsertOneResult, ObjectId } from 'mongodb';
import sanitize from 'mongo-sanitize';
import { Account, AccountProperties } from '../../domain/entities/account';
import {
  AccountQueryDto,
  IAccountRepository,
} from '../../domain/account/i-account-repository';
import Result from '../../domain/value-types/transient-types/result';
import { close, connect, createClient } from './db/mongo-db';

interface AccountPersistence {
  _id: string;
  userId: string;
  organizationId: string;
  modifiedOn: number;
}

const collectionName = 'accounts';

export default class AccountRepositoryImpl implements IAccountRepository {
  public findOne = async (id: string): Promise<Account | null> => {
    const client = createClient();
    const db = await connect(client);
    const result: any = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(sanitize(id)) });

    close(client);

    if (!result) return null;

    return this.#toEntity(this.#buildProperties(result));
  };

  public findBy = async (
    accountQueryDto: AccountQueryDto
  ): Promise<Account[]> => {
    if (!Object.keys(accountQueryDto).length) return this.all();

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
  };

  #buildFilter = (accountQueryDto: AccountQueryDto): any => {
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
    const db = await connect(client);
    const result: FindCursor = await db.collection(collectionName).find();
    const results = await result.toArray();

    close(client);

    if (!results || !results.length) return [];

    return results.map((element: any) =>
      this.#toEntity(this.#buildProperties(element))
    );
  };

  public insertOne = async (account: Account): Promise<Result<null>> => {
    try {
      const client = createClient();
      const db = await connect(client);
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(sanitize(account)));

      if (!result.acknowledged)
        throw new Error('Account creation failed. Insert not acknowledged');

      close(client);

      return Result.ok<null>();
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  };

  #toEntity = (accountProperties: AccountProperties): Account => {
    const createAccountResult: Result<Account> =
      Account.create(accountProperties);

    if (createAccountResult.error) throw new Error(createAccountResult.error);
    if (!createAccountResult.value) throw new Error('Account creation failed');

    return createAccountResult.value;
  };

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

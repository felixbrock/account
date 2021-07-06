import fs from 'fs';
import path from 'path';
import { Account, AccountProperties } from '../../domain/entities/account';
import {
  IAccountRepository,
} from '../../domain/account/i-account-repository';
import Result from '../../domain/value-types/transient-types/result';

interface AccountPersistence {
  id: string;
  userId: string;
}

export default class AccountRepositoryImpl implements IAccountRepository {
  public async findOne(id: string): Promise<Account | null> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result: AccountPersistence = db.accounts.find(
      (accountEntity: { id: string }) => accountEntity.id === id
    );

    if (!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  }

  public async save(account: Account): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      db.accounts.push(this.#toPersistence(account));

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #toEntity = (accountProperties: AccountProperties): Account => {
    const createAccountResult: Result<Account> =
      Account.create(accountProperties);

    if (createAccountResult.error) throw new Error(createAccountResult.error);
    if (!createAccountResult.value) throw new Error('Account creation failed');

    return createAccountResult.value;
  };

  #buildProperties = (account: AccountPersistence): AccountProperties => ({
    id: account.id,
    userId: account.userId,
  });

  #toPersistence = (account: Account): AccountPersistence => ({
    id: account.id,
    userId: account.userId,
  });
}

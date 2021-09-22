import { Account } from '../entities/account';
import Result from '../value-types/transient-types/result';

export interface AccountQueryDto {
  userId?: string;
  organizationId?: string;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface IAccountRepository {
  findOne(id: string): Promise<Account | null>;
  findBy(
    accountQueryDto: AccountQueryDto
  ): Promise<Account[]>;
  all(): Promise<Account[]>;
  insertOne(account: Account): Promise<Result<null>>;
}

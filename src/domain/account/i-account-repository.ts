import { Account } from '../entities/account';

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
  insertOne(account: Account): Promise<string>;
}

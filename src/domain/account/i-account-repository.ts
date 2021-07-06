import { Account } from '../entities/account';
import Result from '../value-types/transient-types/result';

export interface AccountQueryDto {
  userId?: string;
}

export interface IAccountRepository {
  findOne(id: string): Promise<Account | null>;
  findBy(
    accountQueryDto: AccountQueryDto
  ): Promise<Account[]>;
  all(): Promise<Account[]>;
  save(account: Account): Promise<Result<null>>;
}

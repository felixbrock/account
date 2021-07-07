import { Account } from '../entities/account';

export interface AccountDto {
  id: string;
  userId: string;
  modifiedOn: number;
}

export const buildAccountDto = (account: Account): AccountDto => ({
  id: account.id,
  userId: account.userId,
  modifiedOn: account.modifiedOn,
});

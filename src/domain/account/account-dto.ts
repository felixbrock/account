import { Account } from '../entities/account';

export interface AccountDto {
  id: string;
  userId: string;
}

export const buildAccountDto = (account: Account): AccountDto => ({
  id: account.id,
  userId: account.userId,
});

// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Account, AccountProperties } from '../entities/account';
import { buildAccountDto, AccountDto } from './account-dto';
import { IAccountRepository } from './i-account-repository';
import Result from '../value-types/transient-types/result';

export interface CreateAccountRequestDto {
  userId: string;
}

export type CreateAccountResponseDto = Result<AccountDto | null>;

export class CreateAccount
  implements IUseCase<CreateAccountRequestDto, CreateAccountResponseDto>
{
  #accountRepository: IAccountRepository;

  public constructor(accountRepository: IAccountRepository) {
    this.#accountRepository = accountRepository;
  }

  public async execute(
    request: CreateAccountRequestDto
  ): Promise<CreateAccountResponseDto> {
    const account: Result<Account | null> = this.#createAccount(request);
    if (!account.value) return account;

    try {
      const readAccountResult: AccountDto[] =
        await this.#accountRepository.findBy({
          userId: account.value.userId,
        });
      if (readAccountResult.length)
        throw new Error(
          `User ${account.value.userId} has already an account with the id ${account.value.id}`
        );

      // TODO Install error handling
      await this.#accountRepository.insertOne(account.value);

      return Result.ok<AccountDto>(buildAccountDto(account.value));
    } catch (error: any) {
      return Result.fail<AccountDto>(typeof error === 'string' ? error : error.message);
    }
  }

  #createAccount = (
    request: CreateAccountRequestDto
  ): Result<Account | null> => {
    const accountProperties: AccountProperties = {
      id: new ObjectId().toHexString(),
      userId: request.userId,
    };

    return Account.create(accountProperties);
  };
}

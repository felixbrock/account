// TODO Violation of Dependency Rule
import { v4 as uuidv4 } from 'uuid';
import IUseCase from '../services/use-case';
import Id from '../value-types/id';
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
      await this.#accountRepository.save(account.value);

      return Result.ok<AccountDto>(buildAccountDto(account.value));
    } catch (error) {
      return Result.fail<AccountDto>(error.message);
    }
  }

  #createAccount = (
    request: CreateAccountRequestDto
  ): Result<Account | null> => {
    const accountProperties: AccountProperties = {
      id: Id.next(uuidv4).id,
      userId: request.userId,
    };

    return Account.create(accountProperties);
  };
}

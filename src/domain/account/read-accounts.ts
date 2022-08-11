import { Account } from '../entities/account';
import IUseCase from '../services/use-case';
import { IAccountRepository, AccountQueryDto } from './i-account-repository';
import { AccountDto, buildAccountDto } from './account-dto';
import Result from '../value-types/transient-types/result';

export interface ReadAccountsRequestDto {
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface ReadAccountsAuthDto {
  userId: string;
}

export type ReadAccountsResponseDto = Result<AccountDto[]>;

export class ReadAccounts
  implements
    IUseCase<
      ReadAccountsRequestDto,
      ReadAccountsResponseDto,
      ReadAccountsAuthDto
    >
{
  #accountRepository: IAccountRepository;

  constructor(accountRepository: IAccountRepository) {
    this.#accountRepository = accountRepository;
  }

  async execute(
    request: ReadAccountsRequestDto,
    auth: ReadAccountsAuthDto
  ): Promise<ReadAccountsResponseDto> {
    try {
      const accounts: Account[] = await this.#accountRepository.findBy(
        this.#buildAccountQueryDto(request, auth)
      );
      if (!accounts) throw new Error(`Queried accounts do not exist`);

      return Result.ok(accounts.map((account) => buildAccountDto(account)));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #buildAccountQueryDto = (
    request: ReadAccountsRequestDto,
    auth: ReadAccountsAuthDto
  ): AccountQueryDto => {
    const queryDto: AccountQueryDto = {};

    queryDto.userId = auth.userId;
    if (request.modifiedOnStart)
      queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}

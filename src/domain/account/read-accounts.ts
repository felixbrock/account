import { Account } from '../entities/account';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { IAccountRepository, AccountQueryDto } from './i-account-repository';
import { AccountDto, buildAccountDto } from './account-dto';

export interface ReadAccountsRequestDto {
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface ReadAccountsAuthDto {
  userId: string;
}

export type ReadAccountsResponseDto = Result<AccountDto[] | null>;

export class ReadAccounts
  implements
    IUseCase<
      ReadAccountsRequestDto,
      ReadAccountsResponseDto,
      ReadAccountsAuthDto
    >
{
  #accountRepository: IAccountRepository;

  public constructor(accountRepository: IAccountRepository) {
    this.#accountRepository = accountRepository;
  }

  public async execute(
    request: ReadAccountsRequestDto,
    auth: ReadAccountsAuthDto
  ): Promise<ReadAccountsResponseDto> {
    try {
      const accounts: Account[] | null = await this.#accountRepository.findBy(
        this.#buildAccountQueryDto(request, auth)
      );
      if (!accounts) throw new Error(`Queried accounts do not exist`);

      return Result.ok<AccountDto[]>(
        accounts.map((account) => buildAccountDto(account))
      );
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
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

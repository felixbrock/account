// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadAccount,
  ReadAccountAuthDto,
  ReadAccountRequestDto,
  ReadAccountResponseDto,
} from '../../../domain/account/read-account';
import { ReadAccounts } from '../../../domain/account/read-accounts';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadAccountController extends BaseController {
  #readAccount: ReadAccount;

  #readAccounts: ReadAccounts;

  readonly #dbo: Dbo;

  constructor(readAccount: ReadAccount, readAccounts: ReadAccounts, dbo: Dbo) {
    super();
    this.#readAccount = readAccount;
    this.#readAccounts = readAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (httpRequest: Request): ReadAccountRequestDto => ({
    accountId: httpRequest.params.accountId,
  });

  #buildAuthDto = (userAccountInfo: UserAccountInfo): ReadAccountAuthDto => {
    if (!userAccountInfo.accountId) throw new Error('Unauthorized');

    return {
      accountId: userAccountInfo.accountId,
      isAdmin: userAccountInfo.isAdmin,
    };
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return ReadAccountController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadAccountController.getUserAccountInfo(jwt, this.#readAccounts,  this.#dbo.dbConnection);

      if (!getUserAccountInfoResult.success)
        return ReadAccountController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: ReadAccountRequestDto = this.#buildRequestDto(req);

      const authDto: ReadAccountAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadAccountResponseDto =
        await this.#readAccount.execute(requestDto, authDto, this.#dbo.dbConnection);

      if (!useCaseResult.success) {
        return ReadAccountController.badRequest(res, useCaseResult.error);
      }

      return ReadAccountController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: unknown) {
      if (typeof error === 'string')
        return ReadAccountController.fail(res, error);
      if (error instanceof Error) return ReadAccountController.fail(res, error);
      return ReadAccountController.fail(res, 'Unknown error occured');
    }
  }
}

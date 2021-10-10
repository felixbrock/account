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
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadAccountController extends BaseController {
  #readAccount: ReadAccount;

  #readAccounts: ReadAccounts;

  public constructor(readAccount: ReadAccount, readAccounts: ReadAccounts) {
    super();
    this.#readAccount = readAccount;
    this.#readAccounts = readAccounts;
  }

  #buildRequestDto = (httpRequest: Request): ReadAccountRequestDto => ({
    accountId: httpRequest.params.accountId,
  });

  #buildAuthDto = (userAccountInfo: UserAccountInfo): ReadAccountAuthDto => ({
    accountId: userAccountInfo.accountId,
    isAdmin: userAccountInfo.isAdmin,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return ReadAccountController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadAccountController.getUserAccountInfo(
          token,
          this.#readAccounts
        );

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
        await this.#readAccount.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return ReadAccountController.badRequest(res, useCaseResult.error);
      }

      return ReadAccountController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return ReadAccountController.fail(res, error);
    }
  }
}

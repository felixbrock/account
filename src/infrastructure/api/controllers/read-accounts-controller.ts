// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadAccounts,
  ReadAccountsAuthDto,
  ReadAccountsRequestDto,
  ReadAccountsResponseDto,
} from '../../../domain/account/read-accounts';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadAccountsController extends BaseController {
  #readAccounts: ReadAccounts;

  readonly #dbo: Dbo;

  constructor(readAccounts: ReadAccounts, dbo: Dbo) {
    super();
    this.#readAccounts = readAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (httpRequest: Request): ReadAccountsRequestDto => {
    const {
      userId,
      organizationId,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      userId,
      organizationId,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    ]);

    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in string format'
      );

    return {
      targetUserId: typeof userId === 'string' ? userId : undefined,
      modifiedOnStart:
        typeof modifiedOnStart === 'string'
          ? modifiedOnStart
          : undefined,
      modifiedOnEnd:
        typeof modifiedOnEnd === 'string'
          ? modifiedOnEnd
          : undefined,
    };
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  #buildAuthDto = (userAccountInfo: UserAccountInfo): ReadAccountsAuthDto => ({
    callerUserId: userAccountInfo.userId,
    isSystemInternal: userAccountInfo.isSystemInternal,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return ReadAccountsController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadAccountsController.getUserAccountInfo(
          jwt,
          this.#readAccounts,
          this.#dbo.dbConnection
        );

      if (!getUserAccountInfoResult.success)
        return ReadAccountsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const userAccountInfo = getUserAccountInfoResult.value;

      const buildDtoResult: ReadAccountsRequestDto = this.#buildRequestDto(req);

      const authDto: ReadAccountsAuthDto = this.#buildAuthDto(userAccountInfo);

      const useCaseResult: ReadAccountsResponseDto =
        await this.#readAccounts.execute(
          buildDtoResult,
          authDto,
          this.#dbo.dbConnection
        );

      if (!useCaseResult.success) {
        return ReadAccountsController.badRequest(res, useCaseResult.error);
      }

      return ReadAccountsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: unknown) {
      console.error(error);
      if (typeof error === 'string')
        return ReadAccountsController.fail(res, error);
      if (error instanceof Error)
        return ReadAccountsController.fail(res, error);
      return ReadAccountsController.fail(res, 'Unknown error occured');
    }
  }
}

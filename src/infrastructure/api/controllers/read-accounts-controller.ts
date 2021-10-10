// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadAccounts,
  ReadAccountsAuthDto,
  ReadAccountsRequestDto,
  ReadAccountsResponseDto,
} from '../../../domain/account/read-accounts';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadAccountsController extends BaseController {
  #readAccounts: ReadAccounts;

  public constructor(readAccounts: ReadAccounts) {
    super();
    this.#readAccounts = readAccounts;
  }

  #buildRequestDto = (httpRequest: Request): Result<ReadAccountsRequestDto> => {
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

    try {
      return Result.ok<ReadAccountsRequestDto>({
        modifiedOnStart:
          typeof modifiedOnStart === 'string'
            ? this.#buildDate(modifiedOnStart)
            : undefined,
        modifiedOnEnd:
          typeof modifiedOnEnd === 'string'
            ? this.#buildDate(modifiedOnEnd)
            : undefined,
      });
    } catch (error: any) {
      return Result.fail<ReadAccountsRequestDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  };

  #buildDate = (timestamp: string): number => {
    const date = timestamp.match(/[^T]*/s);
    const time = timestamp.match(/(?<=T)[^Z]*/s);

    if (
      !date ||
      !date[0] ||
      date[0].length !== 8 ||
      !time ||
      !time[0] ||
      time[0].length !== 6
    )
      throw new Error(`${timestamp} not in format YYYYMMDD"T"HHMMSS"Z"`);

    const year = date[0].slice(0, 4);
    const month = date[0].slice(4, 6);
    const day = date[0].slice(6, 8);

    const hour = time[0].slice(0, 2);
    const minute = time[0].slice(2, 4);
    const second = time[0].slice(4, 6);

    return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  #buildAuthDto = (userAccountInfo: UserAccountInfo): ReadAccountsAuthDto => ({
    userId: userAccountInfo.userId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return ReadAccountsController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadAccountsController.getUserAccountInfo(
          token,
          this.#readAccounts
        );

      if (!getUserAccountInfoResult.success)
        return ReadAccountsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: Result<ReadAccountsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadAccountsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return ReadAccountsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const authDto: ReadAccountsAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadAccountsResponseDto =
        await this.#readAccounts.execute(buildDtoResult.value, authDto);

      if (useCaseResult.error) {
        return ReadAccountsController.badRequest(res, useCaseResult.error);
      }

      return ReadAccountsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return ReadAccountsController.fail(res, error);
    }
  }
}

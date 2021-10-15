// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { ReadAccounts } from '../../../domain/account/read-accounts';
import {
  ReadOrganizations,
  ReadOrganizationsAuthDto,
  ReadOrganizationsRequestDto,
  ReadOrganizationsResponseDto,
} from '../../../domain/organization/read-organizations';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadOrganizationsController extends BaseController {
  #readOrganizations: ReadOrganizations;

  #readAccounts: ReadAccounts;

  public constructor(
    readOrganizations: ReadOrganizations,
    readAccounts: ReadAccounts
  ) {
    super();
    this.#readOrganizations = readOrganizations;
    this.#readAccounts = readAccounts;
  }

  #buildRequestDto = (httpRequest: Request): ReadOrganizationsRequestDto => {
    const { name, modifiedOnStart, modifiedOnEnd, timezoneOffset } =
      httpRequest.query;

    const requestValid = this.#queryParametersValid([
      name,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    ]);
    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in string format'
      );

    return {
      name: typeof name === 'string' ? name : undefined,
      modifiedOnStart:
        typeof modifiedOnStart === 'string'
          ? this.#buildDate(modifiedOnStart)
          : undefined,
      modifiedOnEnd:
        typeof modifiedOnEnd === 'string'
          ? this.#buildDate(modifiedOnEnd)
          : undefined,
    };
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

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): ReadOrganizationsAuthDto => ({
    isAdmin: userAccountInfo.isAdmin,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return ReadOrganizationsController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadOrganizationsController.getUserAccountInfo(
          jwt,
          this.#readAccounts
        );

      if (!getUserAccountInfoResult.success)
        return ReadOrganizationsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: ReadOrganizationsRequestDto =
        this.#buildRequestDto(req);

      const authDto: ReadOrganizationsAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadOrganizationsResponseDto =
        await this.#readOrganizations.execute(buildDtoResult, authDto);

      if (useCaseResult.error) {
        return ReadOrganizationsController.badRequest(res, useCaseResult.error);
      }

      return ReadOrganizationsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return ReadOrganizationsController.fail(res, error);
      if (error instanceof Error)
        return ReadOrganizationsController.fail(res, error);
      return ReadOrganizationsController.fail(res, 'Unknown error occured');
    }
  }
}

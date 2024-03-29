// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { ReadAccounts } from '../../../domain/account/read-accounts';
import {
  ReadOrganization,
  ReadOrganizationAuthDto,
  ReadOrganizationRequestDto,
  ReadOrganizationResponseDto,
} from '../../../domain/organization/read-organization';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadOrganizationController extends BaseController {
  #readOrganization: ReadOrganization;

  #readAccounts: ReadAccounts;

  readonly #dbo: Dbo;

  constructor(
    readOrganization: ReadOrganization,
    readAccounts: ReadAccounts,
    dbo: Dbo
  ) {
    super();
    this.#readOrganization = readOrganization;
    this.#readAccounts = readAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (httpRequest: Request): ReadOrganizationRequestDto => ({
    targetOrgId: httpRequest.params.organizationId,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): ReadOrganizationAuthDto => {
    if (!userAccountInfo.callerOrgId) throw new Error('Unauthorized');

    return {
      callerOrgId: userAccountInfo.callerOrgId,
      isSystemInternal: userAccountInfo.isSystemInternal,
    };
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return ReadOrganizationController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadOrganizationController.getUserAccountInfo(
          jwt,
          this.#readAccounts, this.#dbo.dbConnection
        );

      if (!getUserAccountInfoResult.success)
        return ReadOrganizationController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: ReadOrganizationRequestDto = this.#buildRequestDto(req);
      const authDto: ReadOrganizationAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadOrganizationResponseDto =
        await this.#readOrganization.execute(requestDto, authDto, this.#dbo.dbConnection);

      if (!useCaseResult.success) {
        return ReadOrganizationController.badRequest(res, useCaseResult.error);
      }

      return ReadOrganizationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      console.error(error);
      if (typeof error === 'string')
        return ReadOrganizationController.fail(res, error);
      if (error instanceof Error)
        return ReadOrganizationController.fail(res, error);
      return ReadOrganizationController.fail(res, 'Unknown error occured');
    }
  }
}

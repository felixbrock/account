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
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadOrganizationController extends BaseController {
  #readOrganization: ReadOrganization;

  #readAccounts: ReadAccounts;

  constructor(
    readOrganization: ReadOrganization,
    readAccounts: ReadAccounts
  ) {
    super();
    this.#readOrganization = readOrganization;
    this.#readAccounts = readAccounts;
  }

  #buildRequestDto = (httpRequest: Request): ReadOrganizationRequestDto => ({
    targetOrganizationId: httpRequest.params.organizationId,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): ReadOrganizationAuthDto => ({
    callerOrganizationId: userAccountInfo.callerOrganizationId,
    isAdmin: userAccountInfo.isAdmin,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return ReadOrganizationController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadOrganizationController.getUserAccountInfo(
          jwt,
          this.#readAccounts
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
        await this.#readOrganization.execute(requestDto, authDto);

      if (!useCaseResult.success) {
        return ReadOrganizationController.badRequest(res, useCaseResult.error);
      }

      return ReadOrganizationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return ReadOrganizationController.fail(res, error);
      if (error instanceof Error)
        return ReadOrganizationController.fail(res, error);
      return ReadOrganizationController.fail(res, 'Unknown error occured');
    }
  }
}

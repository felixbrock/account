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
import Dbo from '../../persistence/db/mongo-db';

import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadOrganizationsController extends BaseController {
  readonly #readAccounts: ReadAccounts;

  readonly #readOrganizations: ReadOrganizations;

  readonly #dbo: Dbo;

  constructor(
    readAccounts: ReadAccounts,
    readOrganizations: ReadOrganizations,
    dbo: Dbo
  ) {
    super();
    this.#readAccounts = readAccounts;
    this.#readOrganizations = readOrganizations;
    this.#dbo = dbo;
  }

  #buildRequestDto = (): ReadOrganizationsRequestDto => ({});

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): ReadOrganizationsAuthDto => ({
    isSystemInternal: userAccountInfo.isSystemInternal,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return ReadOrganizationsController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserOrganizationInfoResult: Result<UserAccountInfo> =
        await ReadOrganizationsController.getUserAccountInfo(
          jwt,
          this.#readAccounts,
          this.#dbo.dbConnection
        );

      if (!getUserOrganizationInfoResult.success)
        return ReadOrganizationsController.unauthorized(
          res,
          getUserOrganizationInfoResult.error
        );
      if (!getUserOrganizationInfoResult.value)
        throw new Error('Authorization failed');

      if (!getUserOrganizationInfoResult.value.isSystemInternal)
        return ReadOrganizationsController.unauthorized(res, 'Unauthorized');

      const userOrganizationInfo = getUserOrganizationInfoResult.value;

      const buildDtoResult: ReadOrganizationsRequestDto =
        this.#buildRequestDto();

      const authDto: ReadOrganizationsAuthDto =
        this.#buildAuthDto(userOrganizationInfo);

      const useCaseResult: ReadOrganizationsResponseDto =
        await this.#readOrganizations.execute(
          buildDtoResult,
          authDto,
          this.#dbo.dbConnection
        );

      if (!useCaseResult.success) {
        return ReadOrganizationsController.badRequest(res, useCaseResult.error);
      }

      return ReadOrganizationsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      console.error(error);
      if (typeof error === 'string')
        return ReadOrganizationsController.fail(res, error);
      if (error instanceof Error)
        return ReadOrganizationsController.fail(res, error);
      return ReadOrganizationsController.fail(res, 'Unknown error occured');
    }
  }
}

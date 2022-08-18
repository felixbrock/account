// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { ReadAccounts } from '../../../domain/account/read-accounts';
import {
  CreateOrganization,
  CreateOrganizationAuthDto,
  CreateOrganizationRequestDto,
  CreateOrganizationResponseDto,
} from '../../../domain/organization/create-organization';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateOrganizationController extends BaseController {
  #createOrganization: CreateOrganization;

  #readAccounts: ReadAccounts;

  readonly #dbo: Dbo;


  constructor(
    createOrganization: CreateOrganization,
    readAccounts: ReadAccounts,
    dbo: Dbo
  ) {
    super();
    this.#createOrganization = createOrganization;
    this.#readAccounts = readAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (httpRequest: Request): CreateOrganizationRequestDto => ({
    name: httpRequest.body.name,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): CreateOrganizationAuthDto => ({
    isAdmin: userAccountInfo.isAdmin,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return CreateOrganizationController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateOrganizationController.getUserAccountInfo(
          jwt,
          this.#readAccounts,  this.#dbo
        );

      if (!getUserAccountInfoResult.success)
        return CreateOrganizationController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      if (!getUserAccountInfoResult.value.isAdmin)
        return CreateOrganizationController.unauthorized(
          res,
          'Not authorized to perform action'
        );

      const requestDto: CreateOrganizationRequestDto =
        this.#buildRequestDto(req);
      const authDto: CreateOrganizationAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateOrganizationResponseDto =
        await this.#createOrganization.execute(requestDto, authDto, this.#dbo);

      if (!useCaseResult.success) {
        return CreateOrganizationController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return CreateOrganizationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return CreateOrganizationController.fail(res, error);
      if (error instanceof Error)
        return CreateOrganizationController.fail(res, error);
      return CreateOrganizationController.fail(res, 'Unknown error occured');
    }
  }
}

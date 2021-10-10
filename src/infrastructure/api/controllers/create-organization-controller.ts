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
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateOrganizationController extends BaseController {
  #createOrganization: CreateOrganization;

  #readAccounts: ReadAccounts;

  public constructor(
    createOrganization: CreateOrganization,
    readAccounts: ReadAccounts
  ) {
    super();
    this.#createOrganization = createOrganization;
    this.#readAccounts = readAccounts;
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
      const token = req.headers.authorization;

      if (!token)
        return CreateOrganizationController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateOrganizationController.getUserAccountInfo(
          token,
          this.#readAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateOrganizationController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: CreateOrganizationRequestDto =
        this.#buildRequestDto(req);
      const authDto: CreateOrganizationAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateOrganizationResponseDto =
        await this.#createOrganization.execute(requestDto, authDto);

      if (useCaseResult.error) {
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
    } catch (error: any) {
      return CreateOrganizationController.fail(res, error);
    }
  }
}

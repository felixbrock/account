export default interface IUseCase<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse> | IResponse;
// eslint-disable-next-line semi
}

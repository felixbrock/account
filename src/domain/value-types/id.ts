export default class Id {
  #id: string;

  public get id(): string {
    return this.#id;
  }

  private constructor(id: string) {
    this.#id = id;
  }

  public static next(generate: () => string): Id {
    return new Id(generate());
  }
}

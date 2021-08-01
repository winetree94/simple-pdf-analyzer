declare class Name {
  public name: string;
  public static get(): Name;
  public static _clearCache(): void;
}

declare class Cmd {
  public cmd: string;
  public static get(): Cmd;
  public static _clearCache(): void;
}

declare class Dict {
  constructor(xref: XRef): Dict;
}

declare class Ref {
  constructor(num: any, gen: any): Ref;
}

declare class RefSet {
  constructor(parent?: Ref): RefSet;
}

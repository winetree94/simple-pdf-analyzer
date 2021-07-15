declare module '*.html' {
  const url: string;
  export = url;
}

declare module '*.scss' {
  const url: string;
  export = url;
}

declare module 'pdfjs-dist/lib/core/pdf_manager' {
  const module: { LocalPdfManager: any };
  export = module;
}

declare module 'pdfjs-dist/lib/core/primitives' {
  const module: {
    Ref: new (num: number, gen: number) => any;
    RefSet: new (parent?: any) => any;
    isDict: (obj: any) => boolean;
    isRef: (obj: any) => boolean;
    isStream: (obj: any) => boolean;
    isName: (obj: any) => boolean;
    isNum: (obj: any) => boolean;
    isBool: (obj: any) => boolean;
    isString: (obj: any) => boolean;
  };
  export = module;
}

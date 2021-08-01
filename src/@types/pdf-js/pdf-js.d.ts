/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'pdfjs-dist/lib/core/pdf_manager' {
  const module: {
    LocalPdfManager: new (param1: null, param2: Uint8Array) => {
      pdfDocument: {
        parseStartXRef: () => void;
        parse: () => void;
        xref: XRef;
      };
    };
  };
  export = module;
}

declare module 'pdfjs-dist/lib/core/primitives' {
  const module: {
    Ref: Ref;
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

declare module 'pdfjs-dist/lib/shared/util' {
  const module: {
    stringToPDFString: (str: string) => string;
    isAscii: (str: string) => boolean;
  };
  export = module;
}

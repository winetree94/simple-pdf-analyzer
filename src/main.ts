/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './main.scss';
import { LocalPdfManager } from 'pdfjs-dist/lib/core/pdf_manager';
import {
  isDict,
  isStream,
  isRef,
  Ref,
  isName,
  RefSet,
} from 'pdfjs-dist/lib/core/primitives';
import * as PdfJS from 'pdfjs-dist';
import { charCodeToChar, charToCharCode } from './string';

const $canvas = document.getElementById('canvas-root') as HTMLCanvasElement;

PdfJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

class Node {
  public name: string;
  public value: any;
  public hasChild: boolean;
  public type: ValueType;
  public depth: number;
  static xref: any;

  static registerXref(xref?: any) {
    Node.xref = xref;
  }

  constructor(name: string, value: any, depth: number) {
    this.depth = depth;
    this.type = getPdfValueType(value);

    if (this.type === ValueType.REF) {
      this.value = Node.xref.fetch(value);
    } else {
      this.value = value;
    }

    if (this.type === ValueType.STRING && !isAscii(this.value)) {
      this.value = stringToPDFString(this.value);
    }

    this.type = getPdfValueType(this.value);
    this.name = name;

    this.hasChild = [
      ValueType.DICT,
      ValueType.STREAM,
      ValueType.ARRAY,
    ].includes(this.type);
  }

  public getChildren(): Node[] {
    const children: Node[] = [];
    switch (this.type) {
      case ValueType.DICT:
      case ValueType.REF:
        Object.entries(this.value._map).forEach(([key, value]) =>
          children.push(new Node(key, value, this.depth + 1))
        );
        break;
      case ValueType.ARRAY:
        this.value.forEach((value: any, index: number) => {
          children.push(new Node(index.toString(), value, this.depth + 1));
        });
        break;
    }
    return children;
  }
}

export const root = document.getElementById('root') as HTMLDivElement;

export enum ValueType {
  DICT = 'dict',
  STREAM = 'stream',
  ARRAY = 'array',
  REF = 'ref',
  NAME = 'name',
  NUM = 'num',
  BOOL = 'bool',
  STRING = 'string',
}

function isAscii(str: string) {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(str);
}

const PDFStringTranslateTable = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0x2d8,
  0x2c7,
  0x2c6,
  0x2d9,
  0x2dd,
  0x2db,
  0x2da,
  0x2dc,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0x2022,
  0x2020,
  0x2021,
  0x2026,
  0x2014,
  0x2013,
  0x192,
  0x2044,
  0x2039,
  0x203a,
  0x2212,
  0x2030,
  0x201e,
  0x201c,
  0x201d,
  0x2018,
  0x2019,
  0x201a,
  0x2122,
  0xfb01,
  0xfb02,
  0x141,
  0x152,
  0x160,
  0x178,
  0x17d,
  0x131,
  0x142,
  0x153,
  0x161,
  0x17e,
  0,
  0x20ac,
];

function stringToPDFString(str: string) {
  const length = str.length,
    strBuf = [];
  if (str[0] === '\xFE' && str[1] === '\xFF') {
    // UTF16BE BOM
    for (let i = 2; i < length; i += 2) {
      strBuf.push(
        String.fromCharCode((str.charCodeAt(i) << 8) | str.charCodeAt(i + 1))
      );
    }
  } else if (str[0] === '\xFF' && str[1] === '\xFE') {
    // UTF16LE BOM
    for (let i = 2; i < length; i += 2) {
      strBuf.push(
        String.fromCharCode((str.charCodeAt(i + 1) << 8) | str.charCodeAt(i))
      );
    }
  } else {
    for (let i = 0; i < length; ++i) {
      const code = PDFStringTranslateTable[str.charCodeAt(i)];
      strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
    }
  }
  return strBuf.join('');
}

function stringToUTF16BEString(str: string) {
  const buf = ['\xFE\xFF'];
  for (let i = 0, ii = str.length; i < ii; i++) {
    const char = str.charCodeAt(i);
    buf.push(
      String.fromCharCode((char >> 8) & 0xff),
      String.fromCharCode(char & 0xff)
    );
  }
  return buf.join('');
}

function getPdfValueType(value: any): ValueType {
  if (isDict(value)) {
    return ValueType.DICT;
  } else if (isStream(value)) {
    return ValueType.STREAM;
  } else if (Array.isArray(value)) {
    return ValueType.ARRAY;
  } else if (isRef(value)) {
    return ValueType.REF;
  } else if (isName(value)) {
    return ValueType.NAME;
  } else if (typeof value === 'boolean') {
    return ValueType.BOOL;
  } else if (typeof value === 'string') {
    return ValueType.STRING;
  } else if (typeof value === 'number') {
    return ValueType.NUM;
  } else {
    console.log(value);
    throw new Error('Unresolvable value type!');
  }
}

function parseArrayBuffer(data: Uint8Array): any {
  const pdfManager = new LocalPdfManager(null, data).pdfDocument;
  pdfManager.parseStartXRef();
  pdfManager.parse();
  const tree = pdfManager.xref.trailer;
  return tree;
}

function isPdf(file: File): boolean {
  const splitted = file.name.split('.');
  return (
    (splitted[splitted.length - 1] || '').toLowerCase() === 'pdf' &&
    file.type === 'application/pdf'
  );
}

function fileToArrayBuffer(file: File): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(buffer);
      resolve(uint8Array);
    };
    reader.readAsArrayBuffer(file);
  });
}

function getVisualName(node: Node): string {
  return `${node.name}, (${node.type}), ${node.value}`;
}

function createDom(parent: HTMLElement, node: Node) {
  const $ul = document.createElement('ul');
  $ul.classList.add(node.depth % 2 ? 'even' : 'odd');
  node.getChildren().forEach((node) => {
    const $li = document.createElement('li');
    $li.textContent = getVisualName(node);
    $ul.append($li);
    $li.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if ($li.children.length) {
        $li.innerHTML = getVisualName(node);
      } else {
        createDom($li, node);
      }
    });
  });
  parent.append($ul);
}

root.addEventListener('dragenter', (e) => {
  e.preventDefault();
});

root.addEventListener('dragover', (e) => {
  e.preventDefault();
});

root.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.dataTransfer && isPdf(e.dataTransfer.files[0])) {
    root.innerHTML = '';
    const file = e.dataTransfer.files[0];
    fileToArrayBuffer(file)
      .then((buffer) => {
        PdfJS.getDocument(buffer)
          .promise.then((pdf) => {
            pdf.getPage(1).then((page) => {
              console.log('Page loaded');

              const scale = 1.5;
              const viewport = page.getViewport({ scale: scale });

              // Prepare canvas using PDF page dimensions
              const context = $canvas.getContext('2d');
              $canvas.height = viewport.height;
              $canvas.width = viewport.width;

              // Render PDF page into canvas context
              const renderContext = {
                canvasContext: context,
                viewport: viewport,
              };
              const renderTask = page.render({
                canvasContext: context as any,
                viewport: viewport,
              });
              renderTask.promise.then(() => {
                console.log('Page rendered');
              });
            });
          })
          .catch((err) => {
            console.error(err);
          });
        const dict = parseArrayBuffer(buffer);
        Node.registerXref(dict.xref);
        const node = new Node('root', dict, -1);
        createDom(root, node);
      })
      .catch((e) => {
        console.error(e);
      });
  }
});

export const a = 3;

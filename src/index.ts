/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './index.scss';
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
import { isAscii, stringToPDFString } from 'pdfjs-dist/lib/shared/util';

PdfJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

class Node {
  public name: string;
  public value: any;
  public hasChild: boolean;
  public type: ValueType;
  public depth: number;
  static xref: XRef;

  static registerXref(xref: XRef) {
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
    throw new Error('Unresolvable value type!');
  }
}

function parseArrayBuffer(data: Uint8Array): any {
  const manager = new LocalPdfManager(null, data);
  const pdfDocument = manager.pdfDocument;
  pdfDocument.parseStartXRef();
  pdfDocument.parse();
  const tree = pdfDocument.xref.trailer;
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
        const dict = parseArrayBuffer(buffer);
        console.log(dict);
        Node.registerXref(dict.xref);
        const node = new Node('root', dict, -1);
        createDom(root, node);
      })
      .catch((e) => {
        console.error(e);
      });
  }
});

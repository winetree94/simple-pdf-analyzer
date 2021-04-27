import './main.scss';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = '../../build/webpack/pdf.worker.bundle.js';

export const root = document.getElementById('root') as HTMLDivElement;

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
    console.log('passed');
    const file = e.dataTransfer.files[0];

    fileToArrayBuffer(file)
      .then(async (buffer) => {
        const document = await getDocument(buffer).promise;
        console.log(document);

        const fields = await document.getFieldObjects();
        console.log(fields);

        // const responses = await Promise.all(
        //   Array.from(new Array(document.numPages)).map(async (n, index) => {
        //     const page = await document.getPage(index + 1);
        //     console.log(page);
        //   })
        // );

        console.log(document);
      })
      .catch((e) => {
        console.error(e);
      });
  }
});

export const a = 3;

import fs from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import { Document } from './types';

export async function createDocumentsFromPDF(file: string) {
  const parser = new PDFParse({
    data: await fs.readFile(file),
  });

  const output = await parser.getText();

  return output.pages.map(
    (page): PDFDocument => ({
      content: page.text,
      num: page.num,
    }),
  );
}

export type PDFDocument = Document & { num: number };

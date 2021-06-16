import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';
import util from 'util';

import { Parser } from './parser';
const parser = new Parser();
const targetPath = path.join(__dirname, '../**/*.component.html');

async function addTestIds(filePath: string): Promise<void> {
  const root = await parser.getFileRoot(filePath);

  parser.collectNodesWithoutTestId(root).forEach((element) => {
    parser.appendTestId(element);
  });
  const newContent = root.toString();

  return fs.writeFile(filePath, newContent);
}

async function getTemplateFiles(): Promise<string[]> {
  const promiseGlob = util.promisify(glob);

  return promiseGlob(targetPath);
}

async function main(): Promise<void> {
  const templates = await getTemplateFiles();
  await Promise.all(
    templates.map((templateFilePath) => addTestIds(templateFilePath))
  );
}

// main().catch((e) => {
//   console.error(new Error('Something went wrong'));
//   console.error(e);
// });

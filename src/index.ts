import fs from 'fs/promises';
import { targetFilePath } from './contants';

import { Parser } from './parser';

async function main(): Promise<void> {
  const parser = new Parser();
  const root = await parser.getFileRoot(targetFilePath);

  parser.collectNodesWithoutTestId(root).forEach((element) => {
    parser.appendTestId(element);
  });

  const newContent = root.toString();

  return fs.writeFile(targetFilePath, newContent);
}

main().catch((e) => {
  console.error(new Error('Something went wrong'));
  console.error(e);
});

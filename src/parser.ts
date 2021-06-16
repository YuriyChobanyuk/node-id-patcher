import { HTMLElement, parse } from 'node-html-parser';
import fs from 'fs/promises';
import { ATTR_KEY, ATTR_VAL, DATA_TEST_ID_KEY, IGNORE_TAGS } from './contants';
import { generate as generateShortId } from 'shortid';

export class Parser {
  async getFileRoot(filePath: string): Promise<HTMLElement> {
    const fileContent = await fs.readFile(filePath);
    return parse(fileContent.toString(), {
      lowerCaseTagName: false, // convert tag name to lower case (hurt performance heavily)
      comment: true, // retrieve comments (hurt performance slightly)
      blockTextElements: {
        script: true, // keep text content when parsing
        noscript: true, // keep text content when parsing
        style: true, // keep text content when parsing
        pre: true, // keep text content when parsing
      },
    });
  }

  collectNodesWithoutTestId(root: HTMLElement): HTMLElement[] {
    return root.querySelectorAll('*').filter((element) => {
      const rawAttrs = this.getRawAttrs(element);
      return (
        !IGNORE_TAGS.some((tag) => element.rawTagName.startsWith(tag)) &&
        !rawAttrs.includes(DATA_TEST_ID_KEY)
      );
    });
  }

  appendTestId(element: HTMLElement): void {
    // TODO get prefix from file name
    const prefix = 'container-fluid';
    const testId = this.generateTestId(prefix, element.rawTagName);
    const rawAttrs = this.getRawAttrs(element);
    let parsedRowAttributes = this.parseRowAttributes(rawAttrs);

    parsedRowAttributes[DATA_TEST_ID_KEY] = `"${testId}"`;
    this.setRawAttrs(element, parsedRowAttributes);
  }

  private parseRowAttributes(rowAttributes: string): Record<string, string> {
    const splitter = /(?<=[\n"])\s+/gi;
    const removeSpacesAfterEqualitySignReg = /(?<=[\w\])]=)\s+/gi;
    const removeExtraSpacesInsideQuotesReg = /"(\s*)([^"]*?)(\s*)"/gi;
    return rowAttributes
      .trim()
      .replace(removeSpacesAfterEqualitySignReg, '')
      .replace(removeExtraSpacesInsideQuotesReg, '"$2"')
      .split(splitter)
      .reduce((acc, keyValuePair) => {
        const regExpKey = keyValuePair.match(ATTR_KEY)?.[0];
        const regExpVal = keyValuePair.match(ATTR_VAL)?.[0];

        if (!regExpKey) {
          return acc;
        }
        return {
          ...acc,
          [regExpKey]: regExpVal,
        };
      }, {});
  }

  // rawAttrs property is private but it is wrong parsed by library
  private getRawAttrs(target: HTMLElement): string {
    return Reflect.get(target, 'rawAttrs') as string;
  }

  private setRawAttrs(target: HTMLElement, attrRecord: Record<string, string>): void {
    const rawAttrs = Object.keys(attrRecord).reduce((acc, key) => {
      const attrVal = attrRecord[key];
      return !!attrVal ? `${acc}\n ${key}=${attrVal}` : `${acc}\n ${key}`;
    }, '');
    Reflect.set(target, 'rawAttrs', rawAttrs);
  }

  private generateTestId(prefix: string, tagName: string): string {
    return `${prefix}-${tagName}-${generateShortId()}`;
  }
}

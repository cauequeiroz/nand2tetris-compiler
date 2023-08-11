import * as fs from 'fs';
import * as path from 'path';
import { Token } from "./Tokenizer";

export default class XMLWriter {
  private outputFile: fs.WriteStream; 
  private indentationLevel: number = 0;

  constructor (filename: string) {
    this.outputFile = fs.createWriteStream(
      path.resolve(process.cwd(), filename.replace('.jack', '_New.xml')),
      { flags: 'w' }
    ); 
  }

  public indent(): void  {
    this.indentationLevel += 1;
  }

  public outdent(): void {
    this.indentationLevel -= 1;
  }

  public print(text: string): void {
    this.outputFile.write(`${"  ".repeat(this.indentationLevel)}${text}\n`);
  }

  public printToken(token: Token): void {
    const tagNameMap = {
      'INT_CONST': 'integerConstant',
      'STR_CONST': 'stringConstant'
    } as Record<string, string>;

    const tagContentMap = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      'constructor': 'constructor'
    } as Record<string, string>;

    const tagName = tagNameMap[token.type] || token.type.toLowerCase();
    const tagContent = tagContentMap[token.value] || token.value;

    this.print(`<${tagName}> ${tagContent} </${tagName}>`);
  }
}

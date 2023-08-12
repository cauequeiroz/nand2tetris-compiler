import * as fs from 'fs';
import * as path from 'path';
import { Token } from "./Tokenizer";

export default class XMLWriter {
  private outputFile: fs.WriteStream; 
  private indentationLevel: number = 0;

  constructor (filename: string) {
    this.outputFile = fs.createWriteStream(
      path.resolve(process.cwd(), filename),
      { flags: 'w' }
    ); 
  }

  public print(text: string): void {
    this.outputFile.write(`${"  ".repeat(this.indentationLevel)}${text}\n`);
  }

  public openTag(tagName: string): void {
    this.print(`<${tagName}>`);
    this.indent();
  }

  public closeTag(tagName: string): void {
    this.outdent();
    this.print(`</${tagName}>`);
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

  private indent(): void  {
    this.indentationLevel += 1;
  }

  private outdent(): void {
    this.indentationLevel -= 1;
  }
}

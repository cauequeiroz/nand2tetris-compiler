import * as fs from 'fs';
import * as path from 'path';
import { KEYWORDS, LexicalElements, SYMBOLS } from './grammar';

export type Token = {
  type: LexicalElements;
  value: string;
};

export default class Tokenizer {
  private tokens: Token[] = [];
  private counter: number = 0;
  private currentToken: Token;

  constructor(filename: string) {
    const file = this.readFile(filename);
    const words = this.getWordsFromFile(file);

    this.tokens = this.getTokensFromWords(words);
    this.currentToken = this.tokens[this.counter];

    // this.writeTokensOutputFile(filename);
  }

  public hasMoreTokens(): boolean {
    return !!this.currentToken;
  }

  public getCurrentToken(): Token {
    return this.currentToken;
  }

  public peekNextToken(): Token {
    return this.tokens[this.counter + 1];
  }

  public advance(): void {
    this.counter += 1;
    this.currentToken = this.tokens[this.counter];
  }

  private readFile(filename: string): string {
    const rawFile = fs.readFileSync(path.resolve(process.cwd(), filename), {
      encoding: "utf-8",
      flag: "r"
    });

    return rawFile.split('\n').map(line => {
      line = line.trim();
      
      if (line.startsWith("//") || line.startsWith("/*") || line.startsWith("*") || !line) {
        return;
      };

      line = line.split('//')[0];
      line = line.trim();
      return line;
    }).filter(line => line).join(' ');
  }

  private getWordsFromFile(file: string): string[] {
    let words = [];
    let currentWord = ""; 

    for (let i=0; i < file.length; i++) {
      const currentChar = file[i];

      const isSpace = currentChar === " ";
      const isSymbol = SYMBOLS.includes(currentChar);
      const isStringInProgress = (currentWord.match(/"/g)||[]).length === 1;
      
      if (isSpace && !isStringInProgress) {
        if (currentWord !== "") {
          words.push(currentWord);
          currentWord = "";
        }

        continue;
      }

      if (isSymbol) {
        if (currentWord !== "") {
          words.push(currentWord);
          currentWord = "";
        }
        words.push(currentChar);
        continue;
      }

      currentWord += file[i];
    }

    return words;
  }

  private getTokensFromWords(words: string[]): Token[] {
    const tokens: Token[] = [];

    words.forEach(word => {
      const isSymbol = SYMBOLS.includes(word);
      const isKeyword = KEYWORDS.includes(word);
      const isNumeric = /^\d+$/.test(word);
      const isString = word.includes('\"');

      if (isSymbol) {
        tokens.push({
          type: LexicalElements.SYMBOL,
          value: word
        });
        return;
      }

      if (isNumeric) {
        tokens.push({
          type: LexicalElements.INT_CONST,
          value: word
        });
        return;
      }

      if (isString) {
        tokens.push({
          type: LexicalElements.STR_CONST,
          value: word.replace(/"/g, "")
        });
        return;
      }

      if (isKeyword) {
        tokens.push({
          type: LexicalElements.KEYWORD,
          value: word
        });
        return;
      }

      tokens.push({
        type: LexicalElements.IDENTIFIER,
        value: word
      });
    });    

    return tokens;
  }

  private writeTokensOutputFile(filename: string): void {
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

    const file = fs.createWriteStream(
      path.resolve(process.cwd(), filename.replace('.jack', 'T_New.xml')),
      { flags: 'w' }
    ); 

    file.write(`<tokens>\n`);
    this.tokens.forEach(token => {
      const tagName = tagNameMap[token.type] || token.type.toLowerCase();
      const tagContent = tagContentMap[token.value] || token.value;

      file.write(`<${tagName}> ${tagContent} </${tagName}>\n`);
    })
    file.write(`</tokens>\n`);

    file.close();
  }
}

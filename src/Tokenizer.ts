import * as fs from 'fs';
import * as path from 'path';
import { KEYWORDS, LexicalElements, SYMBOLS } from './utils/grammar';
import XMLWriter from './fileWriters/XMLWriter';

export type Token = {
  type: LexicalElements;
  value: string;
};

export default class Tokenizer {
  public filename: string;
  public counter: number = 0;
  private tokens: Token[] = [];
  private currentToken: Token;

  constructor(filename: string, output: boolean) {
    this.filename = filename;
    const file = this.readFile();
    const words = this.getWordsFromFile(file);

    this.tokens = this.getTokensFromWords(words);
    this.currentToken = this.tokens[this.counter];

    if (output) {
      this.writeTokensOnXML();
    }
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

  public reset(): void {
    this.counter = 0;
    this.currentToken = this.tokens[this.counter];
  }

  private writeTokensOnXML(): void {
    const xmlWriter = new XMLWriter(this.filename.replace('.jack', '.tokens.xml'));

    xmlWriter.print('<tokens>');

    this.tokens.forEach(token => {
      xmlWriter.printToken(token);
    });
    
    xmlWriter.print('</tokens>');
  }

  private readFile(): string {
    const rawFile = fs.readFileSync(path.resolve(process.cwd(), this.filename), {
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
}

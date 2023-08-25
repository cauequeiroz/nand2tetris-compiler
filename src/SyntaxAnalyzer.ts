import Parser from "./Parser";
import Tokenizer from "./Tokenizer";

export default class SyntaxAnalyzer {
  private parser: Parser;

  constructor(tokenizer: Tokenizer, output: boolean) {  
    this.parser = new Parser(tokenizer, output);
  }

  public analyze(): void {
    this.parser.start();
  }
}

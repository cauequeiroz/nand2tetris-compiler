import Tokenizer from "./Tokenizer";
import XMLWriter from "./XMLWriter";
import { LexicalElements } from "./grammar";

export default class CompileEngine {
  private tokenizer: Tokenizer;
  private xmlWriter: XMLWriter;

  constructor(tokenizer: Tokenizer, xmlWriter: XMLWriter) {
    this.tokenizer = tokenizer;
    this.xmlWriter = xmlWriter;
  }

  public start(): void {
    this.compileClass();
  }

  private process(entity: string | string[]): void {
    const currentToken = this.tokenizer.getCurrentToken();

    if (currentToken.value === entity || entity.includes(currentToken.value)) {
      this.xmlWriter.printToken(currentToken);
      this.tokenizer.advance();
    } else {
      throw new Error(`Syntax error: ${currentToken.value} <> ${entity}`)
    }
  }

  private processIdentifier(): void {
    const currentToken = this.tokenizer.getCurrentToken();

    if (currentToken.type === LexicalElements.IDENTIFIER) {
      this.xmlWriter.printToken(currentToken);
      this.tokenizer.advance();
    } else {
      throw new Error(`Syntax error: ${currentToken.value} is not an Identifier.`);
    }
  }

  private processType(): void {
    if(this.tokenizer.getCurrentToken().type === LexicalElements.IDENTIFIER) {
      this.processIdentifier();
    } else {
      this.process(['int', 'char', 'boolean']);
    }
  }

  private compileClass(): void {
    this.xmlWriter.openTag('class');

    this.process('class');
    this.processIdentifier();
    this.process('{');
    
    this.compileClassVarDec();

    this.compileSubroutineDec();

    this.xmlWriter.closeTag('class');
  }

  private compileClassVarDec(): void {
    while(['static', 'field'].includes(this.tokenizer.getCurrentToken().value)) {
      this.xmlWriter.openTag('classVarDec');

      this.process(['static', 'field']);
      this.processType();
      this.processIdentifier();

      while(this.tokenizer.getCurrentToken().value === ',') {
        this.process(',');
        this.processIdentifier();
      }
      
      this.process(';');

      this.xmlWriter.closeTag('classVarDec');
    }
  }

  private compileSubroutineDec(): void {
    while(['constructor', 'function', 'method'].includes(this.tokenizer.getCurrentToken().value)) {
      this.xmlWriter.openTag('subroutineDec');

      this.process(['constructor', 'function', 'method']);

      if (this.tokenizer.getCurrentToken().value === 'void') {
        this.process('void');
      } else {
        this.processType();
      }

      this.processIdentifier();
      this.process('(');
      this.compileParameterList();
      this.process(')');
      this.compileSubroutineBody();

      this.xmlWriter.closeTag('subroutineDec');
    }
  }

  private compileSubroutineBody(): void {
    this.xmlWriter.openTag('subroutineBody');

    this.process('{');
    this.compileVarDec();
    this.compileStatements();

    this.xmlWriter.closeTag('subroutineBody');
  }

  private compileParameterList(): void {
    this.xmlWriter.openTag('parameterList');

    while(this.tokenizer.getCurrentToken().value !== ')') {
      this.processType();
      this.processIdentifier();

      while(this.tokenizer.getCurrentToken().value === ',') {
        this.process(',');
        this.processType();
        this.processIdentifier();
      }
    }

    this.xmlWriter.closeTag('parameterList');
  }

  private compileVarDec(): void {
    while(this.tokenizer.getCurrentToken().value === 'var') {
      this.xmlWriter.openTag('varDec');

      this.process('var');
      this.processType();
      this.processIdentifier();

      while(this.tokenizer.getCurrentToken().value === ',') {
        this.process(',');
        this.processIdentifier();
      }

      this.process(';');

      this.xmlWriter.closeTag('varDec');
    }
  }

  private compileStatements(): void {

  }
}

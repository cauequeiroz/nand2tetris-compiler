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
    this.xmlWriter.print('<class>');
    this.xmlWriter.indent();

    this.process('class');
    this.processIdentifier();
    this.process('{');
    
    this.compileClassVarDec();

    this.compileSubroutineDec();

    this.xmlWriter.outdent();
    this.xmlWriter.print('</class>')
  }

  private compileClassVarDec(): void {
    while(['static', 'field'].includes(this.tokenizer.getCurrentToken().value)) {
      this.xmlWriter.print('<classVarDec>');
      this.xmlWriter.indent();

      this.process(['static', 'field']);
      this.processType();
      this.processIdentifier();

      while(this.tokenizer.getCurrentToken().value === ',') {
        this.process(',');
        this.processIdentifier();
      }
      
      this.process(';');

      this.xmlWriter.outdent();
      this.xmlWriter.print('</classVarDec>');
    }
  }

  private compileSubroutineDec(): void {
    while(['constructor', 'function', 'method'].includes(this.tokenizer.getCurrentToken().value)) {
      this.xmlWriter.print('<subroutineDec>');
      this.xmlWriter.indent();

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

      this.xmlWriter.outdent();
      this.xmlWriter.print('</subroutineDec>');
    }
  }

  private compileSubroutineBody(): void {
    this.xmlWriter.print('<subroutineBody>');
    this.xmlWriter.indent();

    this.process('{');
    this.compileVarDec();
    // Continue: this.compileStatements();

    this.xmlWriter.outdent();
    this.xmlWriter.print('</subroutineBody>');
  }

  private compileParameterList(): void {
    this.xmlWriter.print('<parameterList>');
    this.xmlWriter.indent();

    while(this.tokenizer.getCurrentToken().value !== ')') {
      this.processType();
      this.processIdentifier();

      while(this.tokenizer.getCurrentToken().value === ',') {
        this.process(',');
        this.processType();
        this.processIdentifier();
      }
    }

    this.xmlWriter.outdent();
    this.xmlWriter.print('</parameterList>');
  }

  private compileVarDec(): void {
    while(this.tokenizer.getCurrentToken().value === 'var') {
      this.xmlWriter.print('<varDec>');
      this.xmlWriter.indent();

      this.process('var');
      this.processType();
      this.processIdentifier();

      while(this.tokenizer.getCurrentToken().value === ',') {
        this.process(',');
        this.processIdentifier();
      }

      this.process(';');

      this.xmlWriter.outdent();
      this.xmlWriter.print('</varDec>');
    }
  }
}

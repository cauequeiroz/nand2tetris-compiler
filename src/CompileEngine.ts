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
      throw new Error(`[${this.tokenizer.counter}] Syntax error: ${currentToken.value} <> ${entity}`)
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
    this.process('}');

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
    this.process('}');

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
    this.xmlWriter.openTag('statements');

    while(
      ['let', 'if', 'while', 'do', 'return'].includes(
        this.tokenizer.getCurrentToken().value
      )) {
      
        switch(this.tokenizer.getCurrentToken().value) {
          case 'let':
            this.compileLetStatement();
            break;
          case 'do':
            this.compileDoStatement();
            break;
          case 'return':
            this.compileReturnStatement();
            break;
          case 'if':
            this.compileIfStatement();
            break;
          case 'while':
            this.compileWhileStatement();
            break;
          default:
            this.tokenizer.advance();
        }
    }

    this.xmlWriter.closeTag('statements');
  }

  private compileLetStatement(): void {
    this.xmlWriter.openTag('letStatement');

    this.process('let');
    this.processIdentifier();

    // TODO: handle array -> varName[expression]

    this.process('=');
    this.compileExpression();
    this.process(';');

    this.xmlWriter.closeTag('letStatement');
  }

  private compileDoStatement(): void {
    this.xmlWriter.openTag('doStatement');
    
    this.process('do');
    this.processIdentifier();

    if (this.tokenizer.getCurrentToken().value === '.') {
      this.process('.');
      this.processIdentifier();      
    }

    this.process('(');
    this.compileExpressionList();
    this.process(')');    
    this.process(';');

    this.xmlWriter.closeTag('doStatement');
  }

  private compileReturnStatement(): void {
    this.xmlWriter.openTag('returnStatement');

    this.process('return');

    if (this.tokenizer.getCurrentToken().value !== ';') {
      this.compileExpression();
    }

    this.process(';');

    this.xmlWriter.closeTag('returnStatement');
  }

  private compileIfStatement(): void {
    this.xmlWriter.openTag('ifStatement');
    this.process('if');
    this.process('(');
    this.compileExpression();
    this.process(')');
    this.process('{');
    this.compileStatements();
    this.process('}');

    if (this.tokenizer.getCurrentToken().value === 'else') {
      this.process('else');
      this.process('{');
      this.compileStatements();
      this.process('}');
    }

    this.xmlWriter.closeTag('ifStatement');
  }

  private compileWhileStatement(): void {
    this.xmlWriter.openTag('whileStatement');
    
    this.process('while');
    this.process('(');
    this.compileExpression();
    this.process(')');
    this.process('{');
    this.compileStatements();
    this.process('}');

    this.xmlWriter.closeTag('whileStatement');
  }

  /**
   * TODO: Make expressions work
   */
  private compileExpressionList(): void {
    this.xmlWriter.openTag('expressionList');
    if (this.tokenizer.getCurrentToken().value !== ')') {
      this.compileExpression();
    }

    while(this.tokenizer.getCurrentToken().value === ',') {
      this.process(',');
      this.compileExpression();
    }

    this.xmlWriter.closeTag('expressionList');
  }

  private compileExpression(): void {
    this.xmlWriter.openTag('expression');
    this.compileTerm();
    this.xmlWriter.closeTag('expression');
  }

  private compileTerm(): void {
    this.xmlWriter.openTag('term');
    
    if (this.tokenizer.getCurrentToken().value === 'this') {
      this.process('this');
    } else {
      this.processIdentifier();
    }

    this.xmlWriter.closeTag('term');
  }
}

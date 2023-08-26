import SymbolTable from "./SymbolTable";
import Tokenizer from "./Tokenizer";
import VMWriter from "./fileWriters/VMWriter";
import { KEYWORDS_CONSTANT, LexicalElements, OP, UNARY_OP } from "./utils/grammar";

export default class CompileEngine {
  private tokenizer: Tokenizer;
  private vmWriter: VMWriter;
  private symbolTable: SymbolTable;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.symbolTable = new SymbolTable();
    this.vmWriter = new VMWriter(
      this.tokenizer.filename.replace('.jack', '_New.vm')
    );
  }

  private nextToken(): void {
    this.tokenizer.advance();
  }

  private tokenValue(): string {
    return this.tokenizer.getCurrentToken().value;
  }

  private tokenType(): LexicalElements {
    return this.tokenizer.getCurrentToken().type;
  }

  private print(command: string): void {
    this.vmWriter.print(command);
  }

  public start(): void {
    this.tokenizer.reset();
    this.compileClass();
  }
  
  private compileClass(): void {
    // Class Signature
    this.nextToken(); // skip 'class'
    this.symbolTable.setClassName(this.tokenValue());
    this.nextToken();
    this.nextToken(); // skip '{'

    // Class field/static declarations
    this.compileClassVarDec();

    // Class subroutines
    this.compileSubroutineDec();
    // TODO
  }

  private compileClassVarDec(): void {
    let varKind;
    let varType;
    let varName;

    while(['static', 'field'].includes(this.tokenValue())) {
      varKind = this.tokenValue();
      this.nextToken();

      varType = this.tokenValue();
      this.nextToken();

      varName = this.tokenValue();
      this.nextToken();
      
      this.symbolTable.addToClassLevel(varName, varType, varKind);

      while (this.tokenValue() === ',') {
        this.nextToken(); // skip ','
        
        varName = this.tokenValue();
        this.nextToken();

        this.symbolTable.addToClassLevel(varName, varType, varKind);
      }

      this.nextToken(); // skip ';'
    }
  }

  private compileSubroutineDec(): void {
    let subroutineCategory;

    while(['constructor', 'function', 'method'].includes(this.tokenValue())) {
      subroutineCategory = this.tokenValue();
      this.nextToken();

      if (subroutineCategory === 'method') {
        this.symbolTable.addToSubroutineLevel('this', '[className]', 'argument');
      }
      
      this.nextToken(); // skip subroutine type
      this.symbolTable.setSubroutineName(this.tokenValue());
      this.nextToken();
      this.nextToken(); // skip '('
      this.compileParameterList();
      this.nextToken(); // skip ')'
      this.compileSubroutineBody();
    }
  }

  private compileSubroutineBody(): void {
    this.nextToken(); // skip '{'
    this.compileVarDec();

    const subroutineName = this.symbolTable.getSubroutineName();
    const numberOfLocals = this.symbolTable.getNumberOfLocals();
    this.vmWriter.print(`function ${subroutineName} ${numberOfLocals}`);

    this.compileStatements();
  }

  private compileParameterList(): void {
    let paramType;
    let paramName;

    while(this.tokenValue() !== ')') {
      paramType = this.tokenValue();
      this.nextToken();
      paramName = this.tokenValue();
      this.nextToken();

      this.symbolTable.addToSubroutineLevel(paramName, paramType, 'argument');

      while(this.tokenValue() === ',') {
        this.nextToken(); // skip ','

        paramType = this.tokenValue();
        this.nextToken();
        paramName = this.tokenValue();
        this.nextToken();

        this.symbolTable.addToSubroutineLevel(paramName, paramType, 'argument');
      }
    }
  }

  private compileVarDec(): void {
    let varType;
    let varName;

    while(this.tokenValue() === 'var') {
      this.nextToken(); // skip 'var'
      varType = this.tokenValue();
      this.nextToken();
      varName = this.tokenValue();
      this.nextToken();

      this.symbolTable.addToSubroutineLevel(varName, varType, 'local');

      while(this.tokenValue() === ',') {
        this.nextToken(); // skip ','
        varName = this.tokenValue();
        this.nextToken();

        this.symbolTable.addToSubroutineLevel(varName, varType, 'local');
      }

      this.nextToken(); // skip ';'
    }
  }

  private compileStatements(): void {
    while(
      ['let', 'if', 'while', 'do', 'return'].includes(this.tokenValue())
    ) {      
        switch(this.tokenValue()) {
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
  }

  private compileLetStatement(): void {
    
  }

  private compileDoStatement(): void {
    this.nextToken(); // skip 'do'
    this.compileExpression();
    this.nextToken(); // skip ';'
    this.print('pop temp 0');
  }

  private compileReturnStatement(): void {
    this.nextToken(); // skip 'return'

    if (this.tokenizer.getCurrentToken().value !== ';') {
      this.compileExpression();
    } else {
      this.print('push constant 0');
    }

    this.print('return');
    this.nextToken(); // skip ';'
  }

  private compileIfStatement(): void {
    
  }

  private compileWhileStatement(): void {
    
  }

  private compileExpressionList(): number {
    let expressionCounter = 0;

    if (this.tokenValue() !== ')') {
      this.compileExpression();
      expressionCounter += 1;
    }

    while(this.tokenizer.getCurrentToken().value === ',') {
      this.nextToken(); // skip ','
      this.compileExpression();
      expressionCounter += 1;
    }
    
    return expressionCounter;
  }

  private compileExpression(): void {
    this.compileTerm();
    
    while(OP.includes(this.tokenValue())) {
      let operation = this.convertOpToCommand(this.tokenValue());
      this.nextToken();
      this.compileTerm();
      this.print(operation);
    }
  }

  private convertOpToCommand(operation: string) {
    const operationMap = {
      '*': 'call Math.multiply 2',
      '+': 'add'
    } as Record<string, string>;

    return operationMap[operation];
  }

  private compileTerm(): void {
    // integer
    if (this.tokenType() === LexicalElements.INT_CONST) {
      this.print(`push constant ${this.tokenValue()}`);
      this.nextToken();
    
    // (expression)
    } else if (this.tokenValue() === '(') {
      this.nextToken(); // skip '('
      this.compileExpression();
      this.nextToken(); // skip ')'
    
    // subroutine call
    // TODO: handle foo(), handle obj on symbol table
    } else if (this.tokenizer.peekNextToken().value === '.') {
      let objectName = this.tokenValue();
      this.nextToken();
      this.nextToken(); // skip '.'
      let subroutineName = this.tokenValue();
      this.nextToken();
      this.nextToken(); // skip '('
      let numberOfArguments = this.compileExpressionList();
      this.nextToken(); // skip ')'

      this.print(`call ${objectName}.${subroutineName} ${numberOfArguments}`);
    }
  }
}

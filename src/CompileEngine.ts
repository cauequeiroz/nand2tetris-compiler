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
      this.tokenizer.filename.replace('.jack', '.new.vm')
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
      this.compileSubroutineBody(subroutineCategory);
      this.symbolTable.reset();
    }
  }

  private compileSubroutineBody(category: string): void {
    this.nextToken(); // skip '{'
    this.compileVarDec();

    const subroutineName = this.symbolTable.getSubroutineName();
    const numberOfLocals = this.symbolTable.getNumberOfLocals();
    this.print(`function ${subroutineName} ${numberOfLocals}`);

    if (category === 'constructor') {
      this.print(`push constant ${this.symbolTable.getNumberOfFields()}`); 
      this.print(`call Memory.alloc 1`);
      this.print(`pop pointer 0`);
    }

    if (category === 'method') {
      this.print(`push argument 0`);
      this.print(`pop pointer 0`);
    }

    this.compileStatements();
    this.nextToken(); // skip '}'
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
    let varName;
    let isArrayAccess = false;
    
    this.nextToken(); // skip 'let'
    varName = this.tokenValue();
    this.nextToken();

    if (this.tokenValue() === '[') {
      isArrayAccess = true;
      this.nextToken(); // skip '['
      this.compileExpression();
      this.print(`push ${this.symbolTable.getVariable(varName)}`);
      this.print('add')
      this.nextToken(); // skip ']'
    }

    this.nextToken(); // skip '='
    this.compileExpression();
    this.nextToken(); // skip ';'

    if (isArrayAccess) {
      this.print('pop temp 0');
      this.print('pop pointer 1');
      this.print('push temp 0');
      this.print('pop that 0');
    } else {
      this.print(`pop ${this.symbolTable.getVariable(varName)}`)
    }
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
    let index = this.symbolTable.getIfLabelIndex();
    let labelIfTrue = `IF_TRUE${index}`;
    let labelIfFalse = `IF_FALSE${index}`;
    let labelIfEnd = `IF_END${index}`;

    this.nextToken(); // skip 'if'
    this.nextToken(); // skip '('
    this.compileExpression();

    this.print(`if-goto ${labelIfTrue}`);
    this.print(`goto ${labelIfFalse}`);
    this.print(`label ${labelIfTrue}`);

    this.nextToken(); // skip ')'
    this.nextToken(); // skip '{'
    this.compileStatements();
    this.nextToken(); // skip '}'

    if (this.tokenValue() === 'else') {
      this.print(`goto ${labelIfEnd}`);
    }

    this.print(`label ${labelIfFalse}`);

    if (this.tokenValue() === 'else') {
      this.nextToken(); // skip 'else'
      this.nextToken(); // skip '{'
      this.compileStatements();
      this.nextToken(); // skip '}'
      this.print(`label ${labelIfEnd}`);
    }
  }

  private compileWhileStatement(): void {
    let index = this.symbolTable.getWhileLabelIndex();
    let labelWhileExp = `WHILE_EXP${index}`;
    let labelWhileEnd = `WHILE_END${index}`;

    this.print(`label ${labelWhileExp}`);
    this.nextToken(); // skip 'while'
    this.nextToken(); // skip '('
    this.compileExpression();
    this.nextToken(); // skip ')'
    this.print('not')
    this.print(`if-goto ${labelWhileEnd}`);
    this.nextToken(); // skip '{'
    this.compileStatements();
    this.nextToken(); // skip '}'

    this.print(`goto ${labelWhileExp}`);
    this.print(`label ${labelWhileEnd}`);
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
      '/': 'call Math.divide 2',
      '+': 'add',
      '-': 'sub',
      '&': 'and',
      '|': 'or',
      '<': 'lt',
      '>': 'gt',
      '=' : 'eq',
      '~': 'not'
    } as Record<string, string>;

    return operationMap[operation];
  }

  private convertUnaryOpToCommand(operation: string) {
    const operationMap = {
      '-': 'neg',
      '~': 'not'
    } as Record<string, string>;

    return operationMap[operation];
  }

  private compileTerm(): void {
    let checked = false;

    // true, false, null or this
    if (KEYWORDS_CONSTANT.includes(this.tokenValue())) {
      if (this.tokenValue() === 'true') {
        this.print(`push constant 0`);
        this.print(`not`);
      } else if (this.tokenValue() === 'this') {
        this.print('push pointer 0');
      } else {
        this.print(`push constant 0`);
      }
      this.nextToken();
      checked = true;

    // integer
    } else if (this.tokenType() === LexicalElements.INT_CONST) {
      this.print(`push constant ${this.tokenValue()}`);
      this.nextToken();
      checked = true;

    // string
    } else if (this.tokenType() === LexicalElements.STR_CONST) {
      const str = this.tokenValue();
      this.print(`push constant ${str.length}`);
      this.print('call String.new 1');

      str.split('').forEach(letter => {
        this.print(`push constant ${letter.charCodeAt(0)}`);
        this.print('call String.appendChar 2');
      });

      this.nextToken();
      checked = true;    

    // unary operators
    } else if (UNARY_OP.includes(this.tokenValue())) {
      let operation = this.convertUnaryOpToCommand(this.tokenValue());
      this.nextToken();
      this.compileTerm();
      this.print(operation);
      checked = true;

    // (expression)
    } else if (this.tokenValue() === '(') {
      this.nextToken(); // skip '('
      this.compileExpression();
      this.nextToken(); // skip ')'
      checked = true;
    
    // subroutine call: Object.foo(), object.foo()
    } else if (this.tokenizer.peekNextToken().value === '.') {
      let objectName = this.tokenValue();
      this.nextToken();

      let localVariable = this.symbolTable.getVariable(objectName);
      if (localVariable) {
        this.print(`push ${localVariable}`);
        objectName = this.symbolTable.getVariableType(objectName);
      }

      this.nextToken(); // skip '.'
      let subroutineName = this.tokenValue();
      this.nextToken();
      this.nextToken(); // skip '('
      let numberOfArguments = this.compileExpressionList();
      this.nextToken(); // skip ')'
      
      if (localVariable) {
        numberOfArguments += 1;
      }

      this.print(`call ${objectName}.${subroutineName} ${numberOfArguments}`);
      checked = true;
    
    // subroutine call: foo()
    } else if (this.tokenizer.peekNextToken().value === '(') {
      let subroutineName = this.tokenValue();
      this.nextToken();
      this.nextToken(); // skip '('
      this.print('push pointer 0')
      let numberOfArguments = this.compileExpressionList();
      this.nextToken(); // skip ')'

      numberOfArguments += 1;

      this.print(`call ${this.symbolTable.getClassName()}.${subroutineName} ${numberOfArguments}`);
      checked = true;

    // variables
    } else if (this.tokenType() === LexicalElements.IDENTIFIER) {
      if (this.tokenizer.peekNextToken().value === '[') {
        let arrName = this.tokenValue();
        this.nextToken();
        this.nextToken(); // skip '['
        this.compileExpression();
        this.nextToken(); // skip ']'
        this.print(`push ${this.symbolTable.getVariable(arrName)}`)
        this.print('add');
        this.print('pop pointer 1');
        this.print('push that 0');
      } else {
        this.print(`push ${this.symbolTable.getVariable(this.tokenValue())}`);
        this.nextToken();
      }

      checked = true;
    }

    if (!checked) {
      console.log(this.tokenizer.counter, this.tokenValue(), this.tokenType())
    }
  }
}

import Tokenizer from "./Tokenizer";
import VMWriter from "./fileWriters/VMWriter";
import { KEYWORDS_CONSTANT, LexicalElements, OP, UNARY_OP } from "./utils/grammar";

export default class CompileEngine {
  private tokenizer: Tokenizer;
  private vmWriter: VMWriter;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.vmWriter = new VMWriter(
      this.tokenizer.filename.replace('.jack', '_New.vm')
    );
  }

  public start(): void {
    this.tokenizer.reset();
    this.compileClass();
  }
  
  private compileClass(): void {
    console.log('Start to compile class.');    
  }

  private compileClassVarDec(): void {
    
  }

  private compileSubroutineDec(): void {
   
  }

  private compileSubroutineBody(): void {
    
  }

  private compileParameterList(): void {
    
  }

  private compileVarDec(): void {
    
  }

  private compileStatements(): void {
    
  }

  private compileLetStatement(): void {
    
  }

  private compileDoStatement(): void {
    
  }

  private compileReturnStatement(): void {
    
  }

  private compileIfStatement(): void {
    
  }

  private compileWhileStatement(): void {
    
  }

  private compileExpressionList(): number {
    
    return 0;
  }

  private compileExpression(): void {
    
  }

  private compileTerm(): void {
    
  }
}

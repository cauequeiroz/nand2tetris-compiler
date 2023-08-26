type Table = Record<string, {
  type: string;
  kind: string;
  index: number;
}>;

export default class SymbolTable {
  private className!: string;
  private subroutineName!: string;
  private classLevelTable: Table;
  private subroutineTable: Table;
  private kindCounter: Record<string, number>;

  constructor() {
    this.classLevelTable = {};
    this.subroutineTable = {};
    this.kindCounter = {};
  }

  public addToClassLevel(name: string, type: string, kind: string): void {
    this.classLevelTable[name] = {
      type,
      kind,
      index: this.getNextIndex(kind)
    }
  }

  public addToSubroutineLevel(name: string, type: string, kind: string): void {
    this.subroutineTable[name] = {
      type,
      kind,
      index: this.getNextIndex(kind)
    }
  }

  public setClassName(name: string): void {
    this.className = name;
  }

  public setSubroutineName(name: string): void {
    this.subroutineName = name;
  }

  public getSubroutineName(): string {
    return `${this.className}.${this.subroutineName}`;
  }

  public getNumberOfLocals(): number {
    return this.kindCounter['local'] || 0;
  }

  public logClassLevelTable(): void {
    console.log('# Class-level Symbol Table', `[${this.className}]`);
    console.table(this.classLevelTable);
    console.log('---');
  }

  public logSubroutineLevelTable(): void {
    console.log('# Subroutine-level Symbol Table', `[${this.className}.${this.subroutineName}]`);
    console.table(this.subroutineTable);
    console.log('---');
  }

  private getNextIndex(kind: string): number {
    if (!this.kindCounter[kind]) {
      this.kindCounter[kind] = 0;
    }

    const index = this.kindCounter[kind];
    this.kindCounter[kind] += 1;
    
    return index;
  }
}

#! /usr/bin/env node

import Tokenizer from "./Tokenizer";

class Compiler {
  private tokenizer: Tokenizer;

  constructor() {
    const filename = process.argv[2] || './examples/ExpressionLessSquare/Main.jack';
    this.tokenizer = new Tokenizer(filename);
  }
}

new Compiler();

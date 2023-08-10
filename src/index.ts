#! /usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import Tokenizer from "./Tokenizer";

class Compiler {
  private tokenizer!: Tokenizer;

  constructor() {
    const inputPath = process.argv[2] || './examples/ArrayTest';

    if (inputPath.includes('.jack')) {
      this.compileFile(inputPath);
    } else {
      this.compileDirectory(inputPath)
    }
  }

  private compileDirectory(directoryPath: string) {
    const completePath = path.resolve(process.cwd(), directoryPath);

    fs.readdirSync(completePath).forEach((file) => {
      if (file.endsWith('.jack')) { 
        this.compileFile(path.resolve(completePath, file));
      }
    });
  }

  private compileFile(filename: string) {
    this.tokenizer = new Tokenizer(filename);
  }
}

new Compiler();

#! /usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import Tokenizer from "./Tokenizer";
import XMLCompileEngine from './XMLCompileEngine';
import VMCompileEngine from './VMCompileEngine';

type CompilationType = '--xml' | '--vm';

class Compiler {
  private compilationType: CompilationType;

  constructor() {
    const inputPath = process.argv[2] || './examples/Square';
    
    this.compilationType = (process.argv[3] || '--vm') as CompilationType;

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
    let tokenizer = new Tokenizer(filename);
    let compileEngine;

    if (this.compilationType === '--vm') {
      compileEngine = new VMCompileEngine(tokenizer);
    } else {
      compileEngine = new XMLCompileEngine(tokenizer);
    }
    
    tokenizer.writeTokensOnXML();
    compileEngine.start();
  }
}

new Compiler();

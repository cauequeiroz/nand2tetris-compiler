#! /usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import Tokenizer from "./Tokenizer";
import SyntaxAnalyzer from './SyntaxAnalyzer';
import CompileEngine from './CompileEngine';

class Compiler {
  private outputTokens: boolean;
  private outputParseTree: boolean;

  constructor() {
    const inputPath = process.argv[2] || './examples/vm/ConvertToBin/Main.jack';
    
    this.outputTokens = process.argv.includes('--token');
    this.outputParseTree = process.argv.includes('--parse-tree');

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
    let tokenizer = new Tokenizer(filename, this.outputTokens);
    let syntaxAnalyzer = new SyntaxAnalyzer(tokenizer, this.outputParseTree);
    let compileEngine = new CompileEngine(tokenizer);

    syntaxAnalyzer.analyze();
    compileEngine.start();
  }
}

new Compiler();

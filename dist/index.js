#! /usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var Tokenizer_1 = __importDefault(require("./Tokenizer"));
var CompileEngine_1 = __importDefault(require("./CompileEngine"));
var Compiler = /** @class */ (function () {
    function Compiler() {
        var inputPath = process.argv[2] || './examples/Square/SquareGame.jack';
        if (inputPath.includes('.jack')) {
            this.compileFile(inputPath);
        }
        else {
            this.compileDirectory(inputPath);
        }
    }
    Compiler.prototype.compileDirectory = function (directoryPath) {
        var _this = this;
        var completePath = path.resolve(process.cwd(), directoryPath);
        fs.readdirSync(completePath).forEach(function (file) {
            if (file.endsWith('.jack')) {
                _this.compileFile(path.resolve(completePath, file));
            }
        });
    };
    Compiler.prototype.compileFile = function (filename) {
        var tokenizer = new Tokenizer_1.default(filename);
        var compileEngine = new CompileEngine_1.default(tokenizer);
        tokenizer.writeTokensOnXML();
        compileEngine.start();
    };
    return Compiler;
}());
new Compiler();

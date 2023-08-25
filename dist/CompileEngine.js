"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VMWriter_1 = __importDefault(require("./VMWriter"));
var CompileEngine = /** @class */ (function () {
    function CompileEngine(tokenizer) {
        this.tokenizer = tokenizer;
        this.vmWriter = new VMWriter_1.default(this.tokenizer.filename.replace('.jack', '_New.vm'));
    }
    CompileEngine.prototype.start = function () {
        this.tokenizer.reset();
        this.compileClass();
    };
    CompileEngine.prototype.compileClass = function () {
        console.log('Start to compile class.');
    };
    CompileEngine.prototype.compileClassVarDec = function () {
    };
    CompileEngine.prototype.compileSubroutineDec = function () {
    };
    CompileEngine.prototype.compileSubroutineBody = function () {
    };
    CompileEngine.prototype.compileParameterList = function () {
    };
    CompileEngine.prototype.compileVarDec = function () {
    };
    CompileEngine.prototype.compileStatements = function () {
    };
    CompileEngine.prototype.compileLetStatement = function () {
    };
    CompileEngine.prototype.compileDoStatement = function () {
    };
    CompileEngine.prototype.compileReturnStatement = function () {
    };
    CompileEngine.prototype.compileIfStatement = function () {
    };
    CompileEngine.prototype.compileWhileStatement = function () {
    };
    CompileEngine.prototype.compileExpressionList = function () {
        return 0;
    };
    CompileEngine.prototype.compileExpression = function () {
    };
    CompileEngine.prototype.compileTerm = function () {
    };
    return CompileEngine;
}());
exports.default = CompileEngine;

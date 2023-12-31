"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VMWriter_1 = __importDefault(require("./VMWriter"));
var grammar_1 = require("./grammar");
var VMCompileEngine = /** @class */ (function () {
    function VMCompileEngine(tokenizer) {
        this.tokenizer = tokenizer;
        this.vmWriter = new VMWriter_1.default(this.tokenizer.filename.replace('.jack', '_New.vm'));
    }
    VMCompileEngine.prototype.start = function () {
        this.compileClass();
    };
    VMCompileEngine.prototype.process = function (entity) {
        var currentToken = this.tokenizer.getCurrentToken();
        if (currentToken.value === entity || entity.includes(currentToken.value)) {
            // this.xmlWriter.printToken(currentToken);
            this.tokenizer.advance();
        }
        else {
            throw new Error("[".concat(this.tokenizer.counter + 2, "] Syntax error: ").concat(currentToken.value, " <> ").concat(entity));
        }
    };
    VMCompileEngine.prototype.processIdentifier = function () {
        var currentToken = this.tokenizer.getCurrentToken();
        if (currentToken.type === grammar_1.LexicalElements.IDENTIFIER) {
            // this.xmlWriter.printToken(currentToken);
            this.tokenizer.advance();
        }
        else {
            throw new Error("[".concat(this.tokenizer.counter + 2, "] Syntax error: ").concat(currentToken.value, " is not an Identifier."));
        }
    };
    VMCompileEngine.prototype.processType = function () {
        if (this.tokenizer.getCurrentToken().type === grammar_1.LexicalElements.IDENTIFIER) {
            this.processIdentifier();
        }
        else {
            this.process(['int', 'char', 'boolean']);
        }
    };
    VMCompileEngine.prototype.processSubroutineCall = function () {
        this.processIdentifier();
        if (this.tokenizer.getCurrentToken().value === '.') {
            this.process('.');
            this.processIdentifier();
        }
        this.process('(');
        this.compileExpressionList();
        this.process(')');
    };
    VMCompileEngine.prototype.processWithoutCheck = function () {
        var currentToken = this.tokenizer.getCurrentToken();
        // this.xmlWriter.printToken(currentToken);
        this.tokenizer.advance();
    };
    VMCompileEngine.prototype.compileClass = function () {
        // this.xmlWriter.openTag('class');
        this.process('class');
        this.processIdentifier();
        this.process('{');
        this.compileClassVarDec();
        this.compileSubroutineDec();
        this.process('}');
        // this.xmlWriter.closeTag('class');
    };
    VMCompileEngine.prototype.compileClassVarDec = function () {
        while (['static', 'field'].includes(this.tokenizer.getCurrentToken().value)) {
            // this.xmlWriter.openTag('classVarDec');
            this.process(['static', 'field']);
            this.processType();
            this.processIdentifier();
            while (this.tokenizer.getCurrentToken().value === ',') {
                this.process(',');
                this.processIdentifier();
            }
            this.process(';');
            // this.xmlWriter.closeTag('classVarDec');
        }
    };
    VMCompileEngine.prototype.compileSubroutineDec = function () {
        while (['constructor', 'function', 'method'].includes(this.tokenizer.getCurrentToken().value)) {
            // this.xmlWriter.openTag('subroutineDec');
            this.process(['constructor', 'function', 'method']);
            if (this.tokenizer.getCurrentToken().value === 'void') {
                this.process('void');
            }
            else {
                this.processType();
            }
            this.processIdentifier();
            this.process('(');
            this.compileParameterList();
            this.process(')');
            this.compileSubroutineBody();
            // this.xmlWriter.closeTag('subroutineDec');
        }
    };
    VMCompileEngine.prototype.compileSubroutineBody = function () {
        // this.xmlWriter.openTag('subroutineBody');
        this.process('{');
        this.compileVarDec();
        this.compileStatements();
        this.process('}');
        // this.xmlWriter.closeTag('subroutineBody');
    };
    VMCompileEngine.prototype.compileParameterList = function () {
        // this.xmlWriter.openTag('parameterList');
        while (this.tokenizer.getCurrentToken().value !== ')') {
            this.processType();
            this.processIdentifier();
            while (this.tokenizer.getCurrentToken().value === ',') {
                this.process(',');
                this.processType();
                this.processIdentifier();
            }
        }
        // this.xmlWriter.closeTag('parameterList');
    };
    VMCompileEngine.prototype.compileVarDec = function () {
        while (this.tokenizer.getCurrentToken().value === 'var') {
            // this.xmlWriter.openTag('varDec');
            this.process('var');
            this.processType();
            this.processIdentifier();
            while (this.tokenizer.getCurrentToken().value === ',') {
                this.process(',');
                this.processIdentifier();
            }
            this.process(';');
            // this.xmlWriter.closeTag('varDec');
        }
    };
    VMCompileEngine.prototype.compileStatements = function () {
        // this.xmlWriter.openTag('statements');
        while (['let', 'if', 'while', 'do', 'return'].includes(this.tokenizer.getCurrentToken().value)) {
            switch (this.tokenizer.getCurrentToken().value) {
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
        // this.xmlWriter.closeTag('statements');
    };
    VMCompileEngine.prototype.compileLetStatement = function () {
        // this.xmlWriter.openTag('letStatement');
        this.process('let');
        this.processIdentifier();
        if (this.tokenizer.getCurrentToken().value === '[') {
            this.process('[');
            this.compileExpression();
            this.process(']');
        }
        this.process('=');
        this.compileExpression();
        this.process(';');
        // this.xmlWriter.closeTag('letStatement');
    };
    VMCompileEngine.prototype.compileDoStatement = function () {
        // this.xmlWriter.openTag('doStatement');
        this.process('do');
        this.processSubroutineCall();
        this.process(';');
        // this.xmlWriter.closeTag('doStatement');
    };
    VMCompileEngine.prototype.compileReturnStatement = function () {
        // this.xmlWriter.openTag('returnStatement');
        this.process('return');
        if (this.tokenizer.getCurrentToken().value !== ';') {
            this.compileExpression();
        }
        this.process(';');
        // this.xmlWriter.closeTag('returnStatement');
    };
    VMCompileEngine.prototype.compileIfStatement = function () {
        // this.xmlWriter.openTag('ifStatement');
        this.process('if');
        this.process('(');
        this.compileExpression();
        this.process(')');
        this.process('{');
        this.compileStatements();
        this.process('}');
        if (this.tokenizer.getCurrentToken().value === 'else') {
            this.process('else');
            this.process('{');
            this.compileStatements();
            this.process('}');
        }
        // this.xmlWriter.closeTag('ifStatement');
    };
    VMCompileEngine.prototype.compileWhileStatement = function () {
        // this.xmlWriter.openTag('whileStatement');
        this.process('while');
        this.process('(');
        this.compileExpression();
        this.process(')');
        this.process('{');
        this.compileStatements();
        this.process('}');
        // this.xmlWriter.closeTag('whileStatement');
    };
    /**
     * TODO: Return number of expressions
     */
    VMCompileEngine.prototype.compileExpressionList = function () {
        // this.xmlWriter.openTag('expressionList');
        if (this.tokenizer.getCurrentToken().value !== ')') {
            this.compileExpression();
        }
        while (this.tokenizer.getCurrentToken().value === ',') {
            this.process(',');
            this.compileExpression();
        }
        // this.xmlWriter.closeTag('expressionList');
    };
    VMCompileEngine.prototype.compileExpression = function () {
        // this.xmlWriter.openTag('expression');
        this.compileTerm();
        while (grammar_1.OP.includes(this.tokenizer.getCurrentToken().value)) {
            this.process(this.tokenizer.getCurrentToken().value);
            this.compileTerm();
        }
        // this.xmlWriter.closeTag('expression');
    };
    VMCompileEngine.prototype.compileTerm = function () {
        // this.xmlWriter.openTag('term');
        // true, false, null or this
        if (grammar_1.KEYWORDS_CONSTANT.includes(this.tokenizer.getCurrentToken().value)) {
            this.process(this.tokenizer.getCurrentToken().value);
            // unary operators
        }
        else if (grammar_1.UNARY_OP.includes(this.tokenizer.getCurrentToken().value)) {
            this.process(this.tokenizer.getCurrentToken().value);
            this.compileTerm();
            // string or integer
        }
        else if ([
            grammar_1.LexicalElements.STR_CONST,
            grammar_1.LexicalElements.INT_CONST
        ].includes(this.tokenizer.getCurrentToken().type)) {
            this.processWithoutCheck();
            // (expression)
        }
        else if (this.tokenizer.getCurrentToken().value === '(') {
            this.process('(');
            this.compileExpression();
            this.process(')');
            // subroutine call
        }
        else if (['(', '.'].includes(this.tokenizer.peekNextToken().value)) {
            this.processSubroutineCall();
            // variables
        }
        else {
            this.processIdentifier();
            if (this.tokenizer.getCurrentToken().value === '[') {
                this.process('[');
                this.compileExpression();
                this.process(']');
            }
        }
        // this.xmlWriter.closeTag('term');
    };
    return VMCompileEngine;
}());
exports.default = VMCompileEngine;

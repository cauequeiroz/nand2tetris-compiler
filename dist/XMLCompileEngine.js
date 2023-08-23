"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var XMLWriter_1 = __importDefault(require("./XMLWriter"));
var grammar_1 = require("./grammar");
var XMLCompileEngine = /** @class */ (function () {
    function XMLCompileEngine(tokenizer) {
        this.tokenizer = tokenizer;
        this.xmlWriter = new XMLWriter_1.default(this.tokenizer.filename.replace('.jack', '_New.xml'));
    }
    XMLCompileEngine.prototype.start = function () {
        this.compileClass();
    };
    XMLCompileEngine.prototype.process = function (entity) {
        var currentToken = this.tokenizer.getCurrentToken();
        if (currentToken.value === entity || entity.includes(currentToken.value)) {
            this.xmlWriter.printToken(currentToken);
            this.tokenizer.advance();
        }
        else {
            throw new Error("[".concat(this.tokenizer.counter + 2, "] Syntax error: ").concat(currentToken.value, " <> ").concat(entity));
        }
    };
    XMLCompileEngine.prototype.processIdentifier = function () {
        var currentToken = this.tokenizer.getCurrentToken();
        if (currentToken.type === grammar_1.LexicalElements.IDENTIFIER) {
            this.xmlWriter.printToken(currentToken);
            this.tokenizer.advance();
        }
        else {
            throw new Error("[".concat(this.tokenizer.counter + 2, "] Syntax error: ").concat(currentToken.value, " is not an Identifier."));
        }
    };
    XMLCompileEngine.prototype.processType = function () {
        if (this.tokenizer.getCurrentToken().type === grammar_1.LexicalElements.IDENTIFIER) {
            this.processIdentifier();
        }
        else {
            this.process(['int', 'char', 'boolean']);
        }
    };
    XMLCompileEngine.prototype.processSubroutineCall = function () {
        this.processIdentifier();
        if (this.tokenizer.getCurrentToken().value === '.') {
            this.process('.');
            this.processIdentifier();
        }
        this.process('(');
        this.compileExpressionList();
        this.process(')');
    };
    XMLCompileEngine.prototype.processWithoutCheck = function () {
        var currentToken = this.tokenizer.getCurrentToken();
        this.xmlWriter.printToken(currentToken);
        this.tokenizer.advance();
    };
    XMLCompileEngine.prototype.compileClass = function () {
        this.xmlWriter.openTag('class');
        this.process('class');
        this.processIdentifier();
        this.process('{');
        this.compileClassVarDec();
        this.compileSubroutineDec();
        this.process('}');
        this.xmlWriter.closeTag('class');
    };
    XMLCompileEngine.prototype.compileClassVarDec = function () {
        while (['static', 'field'].includes(this.tokenizer.getCurrentToken().value)) {
            this.xmlWriter.openTag('classVarDec');
            this.process(['static', 'field']);
            this.processType();
            this.processIdentifier();
            while (this.tokenizer.getCurrentToken().value === ',') {
                this.process(',');
                this.processIdentifier();
            }
            this.process(';');
            this.xmlWriter.closeTag('classVarDec');
        }
    };
    XMLCompileEngine.prototype.compileSubroutineDec = function () {
        while (['constructor', 'function', 'method'].includes(this.tokenizer.getCurrentToken().value)) {
            this.xmlWriter.openTag('subroutineDec');
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
            this.xmlWriter.closeTag('subroutineDec');
        }
    };
    XMLCompileEngine.prototype.compileSubroutineBody = function () {
        this.xmlWriter.openTag('subroutineBody');
        this.process('{');
        this.compileVarDec();
        this.compileStatements();
        this.process('}');
        this.xmlWriter.closeTag('subroutineBody');
    };
    XMLCompileEngine.prototype.compileParameterList = function () {
        this.xmlWriter.openTag('parameterList');
        while (this.tokenizer.getCurrentToken().value !== ')') {
            this.processType();
            this.processIdentifier();
            while (this.tokenizer.getCurrentToken().value === ',') {
                this.process(',');
                this.processType();
                this.processIdentifier();
            }
        }
        this.xmlWriter.closeTag('parameterList');
    };
    XMLCompileEngine.prototype.compileVarDec = function () {
        while (this.tokenizer.getCurrentToken().value === 'var') {
            this.xmlWriter.openTag('varDec');
            this.process('var');
            this.processType();
            this.processIdentifier();
            while (this.tokenizer.getCurrentToken().value === ',') {
                this.process(',');
                this.processIdentifier();
            }
            this.process(';');
            this.xmlWriter.closeTag('varDec');
        }
    };
    XMLCompileEngine.prototype.compileStatements = function () {
        this.xmlWriter.openTag('statements');
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
        this.xmlWriter.closeTag('statements');
    };
    XMLCompileEngine.prototype.compileLetStatement = function () {
        this.xmlWriter.openTag('letStatement');
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
        this.xmlWriter.closeTag('letStatement');
    };
    XMLCompileEngine.prototype.compileDoStatement = function () {
        this.xmlWriter.openTag('doStatement');
        this.process('do');
        this.processSubroutineCall();
        this.process(';');
        this.xmlWriter.closeTag('doStatement');
    };
    XMLCompileEngine.prototype.compileReturnStatement = function () {
        this.xmlWriter.openTag('returnStatement');
        this.process('return');
        if (this.tokenizer.getCurrentToken().value !== ';') {
            this.compileExpression();
        }
        this.process(';');
        this.xmlWriter.closeTag('returnStatement');
    };
    XMLCompileEngine.prototype.compileIfStatement = function () {
        this.xmlWriter.openTag('ifStatement');
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
        this.xmlWriter.closeTag('ifStatement');
    };
    XMLCompileEngine.prototype.compileWhileStatement = function () {
        this.xmlWriter.openTag('whileStatement');
        this.process('while');
        this.process('(');
        this.compileExpression();
        this.process(')');
        this.process('{');
        this.compileStatements();
        this.process('}');
        this.xmlWriter.closeTag('whileStatement');
    };
    /**
     * TODO: Return number of expressions
     */
    XMLCompileEngine.prototype.compileExpressionList = function () {
        this.xmlWriter.openTag('expressionList');
        if (this.tokenizer.getCurrentToken().value !== ')') {
            this.compileExpression();
        }
        while (this.tokenizer.getCurrentToken().value === ',') {
            this.process(',');
            this.compileExpression();
        }
        this.xmlWriter.closeTag('expressionList');
    };
    XMLCompileEngine.prototype.compileExpression = function () {
        this.xmlWriter.openTag('expression');
        this.compileTerm();
        while (grammar_1.OP.includes(this.tokenizer.getCurrentToken().value)) {
            this.process(this.tokenizer.getCurrentToken().value);
            this.compileTerm();
        }
        this.xmlWriter.closeTag('expression');
    };
    XMLCompileEngine.prototype.compileTerm = function () {
        this.xmlWriter.openTag('term');
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
        this.xmlWriter.closeTag('term');
    };
    return XMLCompileEngine;
}());
exports.default = XMLCompileEngine;

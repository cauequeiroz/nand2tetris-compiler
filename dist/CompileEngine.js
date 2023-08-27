"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var SymbolTable_1 = __importDefault(require("./SymbolTable"));
var VMWriter_1 = __importDefault(require("./fileWriters/VMWriter"));
var grammar_1 = require("./utils/grammar");
var CompileEngine = /** @class */ (function () {
    function CompileEngine(tokenizer) {
        this.tokenizer = tokenizer;
        this.symbolTable = new SymbolTable_1.default();
        this.vmWriter = new VMWriter_1.default(this.tokenizer.filename.replace('.jack', '.new.vm'));
    }
    CompileEngine.prototype.nextToken = function () {
        this.tokenizer.advance();
    };
    CompileEngine.prototype.tokenValue = function () {
        return this.tokenizer.getCurrentToken().value;
    };
    CompileEngine.prototype.tokenType = function () {
        return this.tokenizer.getCurrentToken().type;
    };
    CompileEngine.prototype.print = function (command) {
        this.vmWriter.print(command);
    };
    CompileEngine.prototype.start = function () {
        this.tokenizer.reset();
        this.compileClass();
    };
    CompileEngine.prototype.compileClass = function () {
        // Class Signature
        this.nextToken(); // skip 'class'
        this.symbolTable.setClassName(this.tokenValue());
        this.nextToken();
        this.nextToken(); // skip '{'
        // Class field/static declarations
        this.compileClassVarDec();
        // Class subroutines
        this.compileSubroutineDec();
        this.nextToken(); // skip '}'
    };
    CompileEngine.prototype.compileClassVarDec = function () {
        var varKind;
        var varType;
        var varName;
        while (['static', 'field'].includes(this.tokenValue())) {
            varKind = this.tokenValue();
            this.nextToken();
            varType = this.tokenValue();
            this.nextToken();
            varName = this.tokenValue();
            this.nextToken();
            this.symbolTable.addToClassLevel(varName, varType, varKind);
            while (this.tokenValue() === ',') {
                this.nextToken(); // skip ','
                varName = this.tokenValue();
                this.nextToken();
                this.symbolTable.addToClassLevel(varName, varType, varKind);
            }
            this.nextToken(); // skip ';'
        }
    };
    CompileEngine.prototype.compileSubroutineDec = function () {
        var subroutineCategory;
        while (['constructor', 'function', 'method'].includes(this.tokenValue())) {
            subroutineCategory = this.tokenValue();
            this.nextToken();
            if (subroutineCategory === 'method') {
                this.symbolTable.addToSubroutineLevel('this', '[className]', 'argument');
            }
            this.nextToken(); // skip subroutine type
            this.symbolTable.setSubroutineName(this.tokenValue());
            this.nextToken();
            this.nextToken(); // skip '('
            this.compileParameterList();
            this.nextToken(); // skip ')'
            this.compileSubroutineBody(subroutineCategory);
            this.symbolTable.reset();
        }
    };
    CompileEngine.prototype.compileSubroutineBody = function (category) {
        this.nextToken(); // skip '{'
        this.compileVarDec();
        var subroutineName = this.symbolTable.getSubroutineName();
        var numberOfLocals = this.symbolTable.getNumberOfLocals();
        this.print("function ".concat(subroutineName, " ").concat(numberOfLocals));
        if (category === 'constructor') {
            this.print("push constant ".concat(this.symbolTable.getNumberOfFields()));
            this.print("call Memory.alloc 1");
            this.print("pop pointer 0");
        }
        if (category === 'method') {
            this.print("push argument 0");
            this.print("pop pointer 0");
        }
        this.compileStatements();
        this.nextToken(); // skip '}'
    };
    CompileEngine.prototype.compileParameterList = function () {
        var paramType;
        var paramName;
        while (this.tokenValue() !== ')') {
            paramType = this.tokenValue();
            this.nextToken();
            paramName = this.tokenValue();
            this.nextToken();
            this.symbolTable.addToSubroutineLevel(paramName, paramType, 'argument');
            while (this.tokenValue() === ',') {
                this.nextToken(); // skip ','
                paramType = this.tokenValue();
                this.nextToken();
                paramName = this.tokenValue();
                this.nextToken();
                this.symbolTable.addToSubroutineLevel(paramName, paramType, 'argument');
            }
        }
    };
    CompileEngine.prototype.compileVarDec = function () {
        var varType;
        var varName;
        while (this.tokenValue() === 'var') {
            this.nextToken(); // skip 'var'
            varType = this.tokenValue();
            this.nextToken();
            varName = this.tokenValue();
            this.nextToken();
            this.symbolTable.addToSubroutineLevel(varName, varType, 'local');
            while (this.tokenValue() === ',') {
                this.nextToken(); // skip ','
                varName = this.tokenValue();
                this.nextToken();
                this.symbolTable.addToSubroutineLevel(varName, varType, 'local');
            }
            this.nextToken(); // skip ';'
        }
    };
    CompileEngine.prototype.compileStatements = function () {
        while (['let', 'if', 'while', 'do', 'return'].includes(this.tokenValue())) {
            switch (this.tokenValue()) {
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
    };
    CompileEngine.prototype.compileLetStatement = function () {
        var varName;
        var isArrayAccess = false;
        this.nextToken(); // skip 'let'
        varName = this.tokenValue();
        this.nextToken();
        if (this.tokenValue() === '[') {
            isArrayAccess = true;
            this.nextToken(); // skip '['
            this.compileExpression();
            this.print("push ".concat(this.symbolTable.getVariable(varName)));
            this.print('add');
            this.nextToken(); // skip ']'
        }
        this.nextToken(); // skip '='
        this.compileExpression();
        this.nextToken(); // skip ';'
        if (isArrayAccess) {
            this.print('pop temp 0');
            this.print('pop pointer 1');
            this.print('push temp 0');
            this.print('pop that 0');
        }
        else {
            this.print("pop ".concat(this.symbolTable.getVariable(varName)));
        }
    };
    CompileEngine.prototype.compileDoStatement = function () {
        this.nextToken(); // skip 'do'
        this.compileExpression();
        this.nextToken(); // skip ';'
        this.print('pop temp 0');
    };
    CompileEngine.prototype.compileReturnStatement = function () {
        this.nextToken(); // skip 'return'
        if (this.tokenizer.getCurrentToken().value !== ';') {
            this.compileExpression();
        }
        else {
            this.print('push constant 0');
        }
        this.print('return');
        this.nextToken(); // skip ';'
    };
    CompileEngine.prototype.compileIfStatement = function () {
        var index = this.symbolTable.getIfLabelIndex();
        var labelIfTrue = "IF_TRUE".concat(index);
        var labelIfFalse = "IF_FALSE".concat(index);
        var labelIfEnd = "IF_END".concat(index);
        this.nextToken(); // skip 'if'
        this.nextToken(); // skip '('
        this.compileExpression();
        this.print("if-goto ".concat(labelIfTrue));
        this.print("goto ".concat(labelIfFalse));
        this.print("label ".concat(labelIfTrue));
        this.nextToken(); // skip ')'
        this.nextToken(); // skip '{'
        this.compileStatements();
        this.nextToken(); // skip '}'
        if (this.tokenValue() === 'else') {
            this.print("goto ".concat(labelIfEnd));
        }
        this.print("label ".concat(labelIfFalse));
        if (this.tokenValue() === 'else') {
            this.nextToken(); // skip 'else'
            this.nextToken(); // skip '{'
            this.compileStatements();
            this.nextToken(); // skip '}'
            this.print("label ".concat(labelIfEnd));
        }
    };
    CompileEngine.prototype.compileWhileStatement = function () {
        var index = this.symbolTable.getWhileLabelIndex();
        var labelWhileExp = "WHILE_EXP".concat(index);
        var labelWhileEnd = "WHILE_END".concat(index);
        this.print("label ".concat(labelWhileExp));
        this.nextToken(); // skip 'while'
        this.nextToken(); // skip '('
        this.compileExpression();
        this.nextToken(); // skip ')'
        this.print('not');
        this.print("if-goto ".concat(labelWhileEnd));
        this.nextToken(); // skip '{'
        this.compileStatements();
        this.nextToken(); // skip '}'
        this.print("goto ".concat(labelWhileExp));
        this.print("label ".concat(labelWhileEnd));
    };
    CompileEngine.prototype.compileExpressionList = function () {
        var expressionCounter = 0;
        if (this.tokenValue() !== ')') {
            this.compileExpression();
            expressionCounter += 1;
        }
        while (this.tokenizer.getCurrentToken().value === ',') {
            this.nextToken(); // skip ','
            this.compileExpression();
            expressionCounter += 1;
        }
        return expressionCounter;
    };
    CompileEngine.prototype.compileExpression = function () {
        this.compileTerm();
        while (grammar_1.OP.includes(this.tokenValue())) {
            var operation = this.convertOpToCommand(this.tokenValue());
            this.nextToken();
            this.compileTerm();
            this.print(operation);
        }
    };
    CompileEngine.prototype.convertOpToCommand = function (operation) {
        var operationMap = {
            '*': 'call Math.multiply 2',
            '/': 'call Math.divide 2',
            '+': 'add',
            '-': 'sub',
            '&': 'and',
            '|': 'or',
            '<': 'lt',
            '>': 'gt',
            '=': 'eq',
            '~': 'not'
        };
        return operationMap[operation];
    };
    CompileEngine.prototype.convertUnaryOpToCommand = function (operation) {
        var operationMap = {
            '-': 'neg',
            '~': 'not'
        };
        return operationMap[operation];
    };
    CompileEngine.prototype.compileTerm = function () {
        var _this = this;
        var checked = false;
        // true, false, null or this
        if (grammar_1.KEYWORDS_CONSTANT.includes(this.tokenValue())) {
            if (this.tokenValue() === 'true') {
                this.print("push constant 0");
                this.print("not");
            }
            else if (this.tokenValue() === 'this') {
                this.print('push pointer 0');
            }
            else {
                this.print("push constant 0");
            }
            this.nextToken();
            checked = true;
            // integer
        }
        else if (this.tokenType() === grammar_1.LexicalElements.INT_CONST) {
            this.print("push constant ".concat(this.tokenValue()));
            this.nextToken();
            checked = true;
            // string
        }
        else if (this.tokenType() === grammar_1.LexicalElements.STR_CONST) {
            var str = this.tokenValue();
            this.print("push constant ".concat(str.length));
            this.print('call String.new 1');
            str.split('').forEach(function (letter) {
                _this.print("push constant ".concat(letter.charCodeAt(0)));
                _this.print('call String.appendChar 2');
            });
            this.nextToken();
            checked = true;
            // unary operators
        }
        else if (grammar_1.UNARY_OP.includes(this.tokenValue())) {
            var operation = this.convertUnaryOpToCommand(this.tokenValue());
            this.nextToken();
            this.compileTerm();
            this.print(operation);
            checked = true;
            // (expression)
        }
        else if (this.tokenValue() === '(') {
            this.nextToken(); // skip '('
            this.compileExpression();
            this.nextToken(); // skip ')'
            checked = true;
            // subroutine call: Object.foo(), object.foo()
        }
        else if (this.tokenizer.peekNextToken().value === '.') {
            var objectName = this.tokenValue();
            this.nextToken();
            var localVariable = this.symbolTable.getVariable(objectName);
            if (localVariable) {
                this.print("push ".concat(localVariable));
                objectName = this.symbolTable.getVariableType(objectName);
            }
            this.nextToken(); // skip '.'
            var subroutineName = this.tokenValue();
            this.nextToken();
            this.nextToken(); // skip '('
            var numberOfArguments = this.compileExpressionList();
            this.nextToken(); // skip ')'
            if (localVariable) {
                numberOfArguments += 1;
            }
            this.print("call ".concat(objectName, ".").concat(subroutineName, " ").concat(numberOfArguments));
            checked = true;
            // subroutine call: foo()
        }
        else if (this.tokenizer.peekNextToken().value === '(') {
            var subroutineName = this.tokenValue();
            this.nextToken();
            this.nextToken(); // skip '('
            this.print('push pointer 0');
            var numberOfArguments = this.compileExpressionList();
            this.nextToken(); // skip ')'
            numberOfArguments += 1;
            this.print("call ".concat(this.symbolTable.getClassName(), ".").concat(subroutineName, " ").concat(numberOfArguments));
            checked = true;
            // variables
        }
        else if (this.tokenType() === grammar_1.LexicalElements.IDENTIFIER) {
            if (this.tokenizer.peekNextToken().value === '[') {
                var arrName = this.tokenValue();
                this.nextToken();
                this.nextToken(); // skip '['
                this.compileExpression();
                this.nextToken(); // skip ']'
                this.print("push ".concat(this.symbolTable.getVariable(arrName)));
                this.print('add');
                this.print('pop pointer 1');
                this.print('push that 0');
            }
            else {
                this.print("push ".concat(this.symbolTable.getVariable(this.tokenValue())));
                this.nextToken();
            }
            checked = true;
        }
        if (!checked) {
            console.log(this.tokenizer.counter, this.tokenValue(), this.tokenType());
        }
    };
    return CompileEngine;
}());
exports.default = CompileEngine;
//# sourceMappingURL=CompileEngine.js.map
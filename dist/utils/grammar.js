"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYWORDS_CONSTANT = exports.KEYWORDS = exports.UNARY_OP = exports.OP = exports.SYMBOLS = exports.LexicalElements = void 0;
var LexicalElements;
(function (LexicalElements) {
    LexicalElements["KEYWORD"] = "KEYWORD";
    LexicalElements["SYMBOL"] = "SYMBOL";
    LexicalElements["INT_CONST"] = "INT_CONST";
    LexicalElements["STR_CONST"] = "STR_CONST";
    LexicalElements["IDENTIFIER"] = "IDENTIFIER";
})(LexicalElements || (exports.LexicalElements = LexicalElements = {}));
;
exports.SYMBOLS = [
    '{',
    '}',
    '(',
    ')',
    '[',
    ']',
    '.',
    ',',
    ';',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '<',
    '>',
    '=',
    '~'
];
exports.OP = [
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '<',
    '>',
    '='
];
exports.UNARY_OP = [
    '-',
    '~'
];
exports.KEYWORDS = [
    'class',
    'constructor',
    'function',
    'method',
    'field',
    'static',
    'var',
    'int',
    'char',
    'boolean',
    'void',
    'true',
    'false',
    'null',
    'this',
    'let',
    'do',
    'if',
    'else',
    'while',
    'return'
];
exports.KEYWORDS_CONSTANT = [
    'true',
    'false',
    'null',
    'this'
];
//# sourceMappingURL=grammar.js.map
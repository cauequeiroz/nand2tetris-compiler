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
var grammar_1 = require("./utils/grammar");
var XMLWriter_1 = __importDefault(require("./fileWriters/XMLWriter"));
var Tokenizer = /** @class */ (function () {
    function Tokenizer(filename, output) {
        this.counter = 0;
        this.tokens = [];
        this.filename = filename;
        var file = this.readFile();
        var words = this.getWordsFromFile(file);
        this.tokens = this.getTokensFromWords(words);
        this.currentToken = this.tokens[this.counter];
        if (output) {
            this.writeTokensOnXML();
        }
    }
    Tokenizer.prototype.hasMoreTokens = function () {
        return !!this.currentToken;
    };
    Tokenizer.prototype.getCurrentToken = function () {
        return this.currentToken;
    };
    Tokenizer.prototype.peekNextToken = function () {
        return this.tokens[this.counter + 1];
    };
    Tokenizer.prototype.advance = function () {
        this.counter += 1;
        this.currentToken = this.tokens[this.counter];
    };
    Tokenizer.prototype.reset = function () {
        this.counter = 0;
        this.currentToken = this.tokens[this.counter];
    };
    Tokenizer.prototype.writeTokensOnXML = function () {
        var xmlWriter = new XMLWriter_1.default(this.filename.replace('.jack', '.tokens.xml'));
        xmlWriter.print('<tokens>');
        this.tokens.forEach(function (token) {
            xmlWriter.printToken(token);
        });
        xmlWriter.print('</tokens>');
    };
    Tokenizer.prototype.readFile = function () {
        var rawFile = fs.readFileSync(path.resolve(process.cwd(), this.filename), {
            encoding: "utf-8",
            flag: "r"
        });
        return rawFile.split('\n').map(function (line) {
            line = line.trim();
            if (line.startsWith("//") || line.startsWith("/*") || line.startsWith("*") || !line) {
                return;
            }
            ;
            line = line.split('//')[0];
            line = line.trim();
            return line;
        }).filter(function (line) { return line; }).join(' ');
    };
    Tokenizer.prototype.getWordsFromFile = function (file) {
        var words = [];
        var currentWord = "";
        for (var i = 0; i < file.length; i++) {
            var currentChar = file[i];
            var isSpace = currentChar === " ";
            var isSymbol = grammar_1.SYMBOLS.includes(currentChar);
            var isStringInProgress = (currentWord.match(/"/g) || []).length === 1;
            if (isSpace && !isStringInProgress) {
                if (currentWord !== "") {
                    words.push(currentWord);
                    currentWord = "";
                }
                continue;
            }
            if (isSymbol) {
                if (currentWord !== "") {
                    words.push(currentWord);
                    currentWord = "";
                }
                words.push(currentChar);
                continue;
            }
            currentWord += file[i];
        }
        return words;
    };
    Tokenizer.prototype.getTokensFromWords = function (words) {
        var tokens = [];
        words.forEach(function (word) {
            var isSymbol = grammar_1.SYMBOLS.includes(word);
            var isKeyword = grammar_1.KEYWORDS.includes(word);
            var isNumeric = /^\d+$/.test(word);
            var isString = word.includes('\"');
            if (isSymbol) {
                tokens.push({
                    type: grammar_1.LexicalElements.SYMBOL,
                    value: word
                });
                return;
            }
            if (isNumeric) {
                tokens.push({
                    type: grammar_1.LexicalElements.INT_CONST,
                    value: word
                });
                return;
            }
            if (isString) {
                tokens.push({
                    type: grammar_1.LexicalElements.STR_CONST,
                    value: word.replace(/"/g, "")
                });
                return;
            }
            if (isKeyword) {
                tokens.push({
                    type: grammar_1.LexicalElements.KEYWORD,
                    value: word
                });
                return;
            }
            tokens.push({
                type: grammar_1.LexicalElements.IDENTIFIER,
                value: word
            });
        });
        return tokens;
    };
    return Tokenizer;
}());
exports.default = Tokenizer;
//# sourceMappingURL=Tokenizer.js.map
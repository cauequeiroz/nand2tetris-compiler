"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Parser_1 = __importDefault(require("./Parser"));
var SyntaxAnalyzer = /** @class */ (function () {
    function SyntaxAnalyzer(tokenizer, output) {
        this.parser = new Parser_1.default(tokenizer, output);
    }
    SyntaxAnalyzer.prototype.analyze = function () {
        this.parser.start();
    };
    return SyntaxAnalyzer;
}());
exports.default = SyntaxAnalyzer;
//# sourceMappingURL=SyntaxAnalyzer.js.map
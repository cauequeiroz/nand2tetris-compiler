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
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var XMLWriter = /** @class */ (function () {
    function XMLWriter(filename) {
        this.indentationLevel = 0;
        this.outputFile = fs.createWriteStream(path.resolve(process.cwd(), filename), { flags: 'w' });
    }
    XMLWriter.prototype.print = function (text) {
        this.outputFile.write("".concat("  ".repeat(this.indentationLevel)).concat(text, "\n"));
    };
    XMLWriter.prototype.openTag = function (tagName) {
        this.print("<".concat(tagName, ">"));
        this.indent();
    };
    XMLWriter.prototype.closeTag = function (tagName) {
        this.outdent();
        this.print("</".concat(tagName, ">"));
    };
    XMLWriter.prototype.printToken = function (token) {
        var tagNameMap = {
            'INT_CONST': 'integerConstant',
            'STR_CONST': 'stringConstant'
        };
        var tagContentMap = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            'constructor': 'constructor'
        };
        var tagName = tagNameMap[token.type] || token.type.toLowerCase();
        var tagContent = tagContentMap[token.value] || token.value;
        this.print("<".concat(tagName, "> ").concat(tagContent, " </").concat(tagName, ">"));
    };
    XMLWriter.prototype.indent = function () {
        this.indentationLevel += 1;
    };
    XMLWriter.prototype.outdent = function () {
        this.indentationLevel -= 1;
    };
    return XMLWriter;
}());
exports.default = XMLWriter;

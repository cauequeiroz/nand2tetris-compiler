"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SymbolTable = /** @class */ (function () {
    function SymbolTable() {
        this.classLevelTable = {};
        this.subroutineTable = {};
        this.kindCounter = {};
        this.labelCounter = {
            while: 0,
            if: 0
        };
    }
    SymbolTable.prototype.addToClassLevel = function (name, type, kind) {
        this.classLevelTable[name] = {
            type: type,
            kind: kind,
            index: this.getNextKindIndex(kind)
        };
    };
    SymbolTable.prototype.addToSubroutineLevel = function (name, type, kind) {
        this.subroutineTable[name] = {
            type: type,
            kind: kind,
            index: this.getNextKindIndex(kind)
        };
    };
    SymbolTable.prototype.setClassName = function (name) {
        this.className = name;
    };
    SymbolTable.prototype.setSubroutineName = function (name) {
        this.subroutineName = name;
    };
    SymbolTable.prototype.getClassName = function () {
        return this.className;
    };
    SymbolTable.prototype.getSubroutineName = function () {
        return "".concat(this.className, ".").concat(this.subroutineName);
    };
    SymbolTable.prototype.getNumberOfLocals = function () {
        return this.kindCounter['local'] || 0;
    };
    SymbolTable.prototype.getNumberOfFields = function () {
        return this.kindCounter['field'] || 0;
    };
    SymbolTable.prototype.logClassLevelTable = function () {
        console.log('# Class-level Symbol Table', "[".concat(this.className, "]"));
        console.table(this.classLevelTable);
        console.log('---');
    };
    SymbolTable.prototype.logSubroutineLevelTable = function () {
        console.log('# Subroutine-level Symbol Table', "[".concat(this.className, ".").concat(this.subroutineName, "]"));
        console.table(this.subroutineTable);
        console.log('---');
    };
    SymbolTable.prototype.getVariable = function (name) {
        var register = this.subroutineTable[name] || this.classLevelTable[name];
        if (!register) {
            return "";
        }
        var segment = register.kind === 'field' ? 'this' : register.kind;
        var number = register.index;
        return "".concat(segment, " ").concat(number);
    };
    SymbolTable.prototype.getVariableType = function (name) {
        var _a;
        return ((_a = this.subroutineTable[name]) === null || _a === void 0 ? void 0 : _a.type) || this.classLevelTable[name].type;
    };
    SymbolTable.prototype.reset = function () {
        this.subroutineTable = {};
        this.kindCounter.local = 0;
        this.kindCounter.argument = 0;
        this.labelCounter = {
            while: 0,
            if: 0
        };
    };
    SymbolTable.prototype.getWhileLabelIndex = function () {
        var index = this.labelCounter.while;
        this.labelCounter.while += 1;
        return index;
    };
    SymbolTable.prototype.getIfLabelIndex = function () {
        var index = this.labelCounter.if;
        this.labelCounter.if += 1;
        return index;
    };
    SymbolTable.prototype.getNextKindIndex = function (kind) {
        if (!this.kindCounter[kind]) {
            this.kindCounter[kind] = 0;
        }
        var index = this.kindCounter[kind];
        this.kindCounter[kind] += 1;
        return index;
    };
    return SymbolTable;
}());
exports.default = SymbolTable;
//# sourceMappingURL=SymbolTable.js.map
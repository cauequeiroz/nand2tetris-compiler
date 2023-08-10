export enum LexicalElements {
  KEYWORD = 'KEYWORD',
  SYMBOL = 'SYMBOL',
  INT_CONST = 'INT_CONST',
  STR_CONST = 'STR_CONST',
  IDENTIFIER = 'IDENTIFIER'
};

export const SYMBOLS = [
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

export const KEYWORDS = [
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

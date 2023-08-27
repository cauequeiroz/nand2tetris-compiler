# Nand2Tetris Compiler

Compiler written in Typescript for Nand2Tetris Jack Language. This Compiler is the project 10/11 of [Nand2Tetris Part 2](https://www.coursera.org/learn/nand2tetris2) course.

More information at:  
[https://www.nand2tetris.org/project10](https://www.nand2tetris.org/project10)  
[https://www.nand2tetris.org/project11](https://www.nand2tetris.org/project11)

## Usage

You can use via `npx` command, but if you want to install locally:
```shell
$ npm install -g @cauequeiroz/nand2tetris-compiler
```

The compiler can receive two options of input: a folder with `.jack` files inside, or a single `.jack` file.

```shell
# Compile all files inside a folder
$ npx @cauequeiroz/nand2tetris-compiler ./path/to/folder

# Compile a single file
$ npx @cauequeiroz/nand2tetris-compiler ./path/to/folder/file.jack
```

Those commands will compile all `.jack` files and generate the compiled `.vm` files.

Finally, you can pass `--token` to generate a `.xml` file with language tokens and `--parse-tree` to generate a `.xml` file with compiler's parse tree.

```shell
# Generate tokens
$ npx @cauequeiroz/nand2tetris-compiler ./path/to/folder --token

# Generate parse tree
$ npx @cauequeiroz/nand2tetris-compiler ./path/to/folder --parse-tree

# Generate tokens and parse tree
$ npx @cauequeiroz/nand2tetris-compiler ./path/to/folder --token --parse-tree
```

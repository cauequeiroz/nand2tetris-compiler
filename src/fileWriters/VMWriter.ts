import * as fs from 'fs';
import * as path from 'path';

export default class VMWriter {
  private outputFile: fs.WriteStream; 

  constructor (filename: string) {
    this.outputFile = fs.createWriteStream(
      path.resolve(process.cwd(), filename),
      { flags: 'w' }
    ); 
  }

  public print(text: string): void {
    this.outputFile.write(text);
  }
}

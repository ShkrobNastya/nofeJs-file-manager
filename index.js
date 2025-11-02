import os from 'os';
import fs from 'fs';
import path from 'path';
import process from 'process';
import readline from 'readline';
import crypto from 'crypto';
import { pipeline } from 'node:stream';
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { promisify } from 'node:util';

const pipe = promisify(pipeline);

let workingDir = os.homedir();
const printWorkingDir = () => console.log(`You are currently in ${workingDir}`);
const args = process.argv.slice(2);

const usernameArg = args.find(arg => arg.startsWith('--username='));
const userName = usernameArg ? usernameArg.split('=')[1] : 'Anonymous';
console.log(`Welcome to the File Manager, ${userName}!`);
printWorkingDir();


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Enter command > '
});

rl.prompt();

function exit() {
  console.log(`Thank you for using File Manager, ${userName}, goodbye!`);
  process.exit(0);
}

rl.on('SIGINT', exit);

const getPath = (p) => path.resolve(workingDir, p);
const handleError = (msg = 'Operation failed') => console.log(msg);

async function mainCommands(input) {
  const [cmd, ...args] = input.trim().split(/\s+/);

  try {
    switch (cmd) {
      case 'up': {
        const parentDir = path.dirname(workingDir);
        if (parentDir !== workingDir) workingDir = parentDir;
        break;
      }

      case 'cd': {
        const targetArg = args[0];

        if (!targetArg) return handleError('Invalid input');

        let targetPath = path.isAbsolute(targetArg)
          ? targetArg
          : getPath(targetArg);

        try {
          const stat = await fs.promises.stat(targetPath);
          if (!stat.isDirectory()) {
            handleError('Invalid input');
            break;
          }
          workingDir = targetPath;
        } catch {
          handleError();
        }
        break;
      }

      case 'ls': {
        const items = await fs.promises.readdir(workingDir, { withFileTypes: true });
        const folders = items.filter(i => i.isDirectory()).map(i => ({ Name: i.name, Type: 'directory' }));
        const files = items.filter(i => i.isFile()).map(i => ({ Name: i.name, Type: 'file' }));
        const list = [...folders.sort((a,b)=>a.Name.localeCompare(b.Name)),
                      ...files.sort((a,b)=>a.Name.localeCompare(b.Name))];
        console.table(list);
        break;
      }

      case 'cat': {
        const filePath = getPath(args[0]);
        try {
          await fs.promises.access(filePath);
          const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
          await new Promise((resolve, reject) => {
            readStream.on('data', chunk => process.stdout.write(chunk));
            readStream.on('end', () => {
              console.log();
              resolve();
            });
            readStream.on('error', reject);
          });
        } catch (err) {
          handleError();
        }
        break;
      }

      case 'add': {
        const newFile = getPath(args[0]);
        await fs.promises.writeFile(newFile, '', { flag: 'wx' });
        break;
      }

      case 'mkdir': {
        const newDir = getPath(args[0]);
        await fs.promises.mkdir(newDir);
        break;
      }

      case 'rn': {
        const [filePath, newName] = args;
        const oldFilePath = getPath(filePath);
        const newFilePath = path.join(path.dirname(oldFilePath), newName);
        await fs.promises.rename(oldFilePath, newFilePath);
        break;
      }

      case 'cp': {
        const [src, destDir] = args;
        const srcPath = getPath(src);
        const destPath = getPath(destDir);
        const fileName = path.basename(srcPath);
        const targetFile = path.join(destPath, fileName);

        try {
          await fs.promises.access(srcPath);
          await fs.promises.access(destPath);

          const readStream = fs.createReadStream(srcPath);
          const writeStream = fs.createWriteStream(targetFile);

          await pipe(readStream, writeStream);

        } catch {
          handleError();
        }

        break;
      }

      case 'mv': {
        const [src, destDir] = args;
        const srcPath = getPath(src);
        const destPath = getPath(destDir);
        const fileName = path.basename(srcPath);
        const targetFile = path.join(destPath, fileName);

        try {
          await fs.promises.access(srcPath);
          await fs.promises.access(destPath);

          const readStream = fs.createReadStream(srcPath);
          const writeStream = fs.createWriteStream(targetFile);

          await pipe(readStream, writeStream);
          await fs.promises.unlink(srcPath);
        } catch {
          handleError('Operation failed');
        }

        break;
      }

      case 'rm': {
        const target = getPath(args[0]);
        await fs.promises.unlink(target);
        break;
      }

      case 'os': {
        const flag = args[0];
        switch (flag) {
          case '--EOL': {
            console.log(JSON.stringify(os.EOL)); 
            break;
          }

          case '--cpus': {
            const cpus = os.cpus();
            console.log(`cpus: ${cpus.length}`);
            cpus.forEach((c, i) =>
              console.log(`${i+1}. ${c.model} - ${(c.speed / 1000).toFixed(2)} GHz`));
            break; 
          }

          case '--homedir': {
            console.log(os.homedir()); 
            break;
          }

          case '--username': {
            console.log(os.userInfo().username); 
            break;
          }

          case '--architecture': {
            console.log(process.arch);
            break;
          }

          default: handleError('Invalid input');
        }
        break;
      }

      case 'hash': {
        const filePath = getPath(args[0]);
        try {
          const finalHash = await new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);

            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', err => reject(err));
          });

          console.log(finalHash);
        } catch {
          handleError('Operation failed');
        }
        break;
        }

      case 'compress': {
        const [src, dest] = args;

        const srcPath = getPath(src);
        const destPath = getPath(dest);
        try {
          await fs.promises.access(srcPath); 
        } catch {
          handleError();
          break;
        }
        const readStream = fs.createReadStream(srcPath);
        const writeStream = fs.createWriteStream(destPath);
        const brotli = createBrotliCompress();
        readStream.pipe(brotli).pipe(writeStream);

        
        readStream.on('error', handleError);
        writeStream.on('error', handleError);
        break;
      }

      case 'decompress': {
        const [src, dest] = args;
        const srcPath = getPath(src);
        const destPath = getPath(dest);
        try {
          await fs.promises.access(srcPath);
        } catch {
          handleError();
          break;
        }
        const readStream = fs.createReadStream(srcPath);
        const writeStream = fs.createWriteStream(destPath);
        const brotli = createBrotliDecompress();
        readStream.pipe(brotli).pipe(writeStream);

        readStream.on('error', handleError);
        writeStream.on('error', handleError);
        break;
      }

      case '.exit':
        exit();
        return;

      default:
        handleError('Invalid input');
    }
  } catch(e) {
    console.log(e);
    handleError('Operation failed');
  }

  printWorkingDir();
  rl.prompt();
}

rl.on('line', mainCommands);

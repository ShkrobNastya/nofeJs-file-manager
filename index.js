import process from 'process';
import readline from 'readline';
import { commands } from './commands.js';
import { getWorkingDir } from './helpers/helpers.js';

let workingDir = getWorkingDir();
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

rl.on('line', async (input) => {
  const [cmd, ...args] = input.trim().split(/\s+/);
  if (cmd === '.exit') {
   exit()
  }

  await commands(cmd, args);

  console.log(`You are currently in ${getWorkingDir()}`);
  rl.prompt();
});

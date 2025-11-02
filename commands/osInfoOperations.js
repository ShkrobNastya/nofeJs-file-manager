import os from 'os';
import process from 'process';
import { handleError } from '../helpers/helpers.js';

export const getOSInfo = (flag) => {
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
}
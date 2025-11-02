import { up, cd, ls } from './commands/navigation.js';
import { add, cat, rn, cp, mv, rm, mkdir } from './commands/fileOperations.js';
import { compress } from './commands/compress.js';
import { decompress } from './commands/decompress.js';
import { getOSInfo } from './commands/osInfoOperations.js';
import { calcHash } from './commands/hash.js';
import { handleError } from './helpers/helpers.js';

export async function commands(cmd, args) {
  switch (cmd) {
    case 'up': return up();
    case 'cd': return cd(args[0]);
    case 'ls': return ls();
    case 'cat': return cat(args[0]);
    case 'add': return add(args[0]);
    case 'rn': return rn(args[0], args[1]);
    case 'cp': return cp(args[0], args[1]);
    case 'mv': return mv(args[0], args[1]);
    case 'rm': return rm(args[0]);
    case 'mkdir': return mkdir(args[0]);
    case 'compress': return compress(args[0], args[1]);
    case 'decompress': return decompress(args[0], args[1]);
    case 'os': return getOSInfo(args[0]);
    case 'hash': return calcHash(args[0]);
    default: handleError('Invalid input');
  }
}

import fs from 'fs';
import { createBrotliDecompress } from 'node:zlib'; 
import { getPath, handleError } from '../helpers/helpers.js';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';

const pipe = promisify(pipeline);

export const decompress = async (src, dest) => {
  if (!src || !dest) {
    handleError('Invalid input');
    return;
  }
  const srcPath = getPath(src);
  const destPath = getPath(dest);
  try {
    await fs.promises.access(srcPath);
    const readStream = fs.createReadStream(srcPath);
    const writeStream = fs.createWriteStream(destPath);
    await pipe(readStream, createBrotliDecompress(), writeStream);
  } catch {
    handleError();
  }
}
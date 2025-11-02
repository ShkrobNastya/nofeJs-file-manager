import fs from 'fs';
import path from 'path';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import { getPath, handleError } from '../helpers/helpers.js';

const pipe = promisify(pipeline);

export const cat = async (file) => {
    const filePath = getPath(file);

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
};

export const add = async (file) => {
    const filePath = getPath(file);

    await fs.promises.writeFile(filePath, '', { flag: 'wx' });
};

export const mkdir = async (file) => {
    const newDir = getPath(file);

    await fs.promises.mkdir(newDir);
};

export const rn = async (filePath, newName) => {
    const oldFilePath = getPath(filePath);
    const newFilePath = path.join(path.dirname(oldFilePath), newName);
    await fs.promises.rename(oldFilePath, newFilePath);
};

export const cp = async (src, destDir) => {
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

    } catch(e) {
        console.log(e);
        handleError();
    }
};

export const mv = async (src, destDir) => {
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
};

export const rm = async (file) => {
    const filePath = getPath(file);
    await fs.promises.unlink(filePath);
};

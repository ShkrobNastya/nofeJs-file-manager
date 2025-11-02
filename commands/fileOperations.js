import fs from 'fs';
import path from 'path';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import { getPath, handleError } from '../helpers/helpers.js';

const pipe = promisify(pipeline);

export const cat = async (file) => {
    if (!file) {
        handleError('Invalid input');
        return;
    }
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
    if (!file) {
        handleError('Invalid input');
        return;
    }
    const filePath = getPath(file);

    await fs.promises.writeFile(filePath, '', { flag: 'wx' });
};

export const mkdir = async (file) => {
    if (!file) {
        handleError('Invalid input');
        return;
    }
    const newDir = getPath(file);

     try {
        await fs.promises.access(newDir);
        handleError();
    } catch {
        try {
            await fs.promises.mkdir(newDir);
        } catch {
            handleError();
        }
    }
};

export const rn = async (filePath, newName) => {
    if (!filePath || !newName) {
        handleError('Invalid input');
        return;
    }
    const oldFilePath = getPath(filePath);
    try {
        await fs.promises.access(oldFilePath);
        const newFilePath = path.join(path.dirname(oldFilePath), newName);
        await fs.promises.rename(oldFilePath, newFilePath);
    } catch {
        handleError();
    }
};

export const cp = async (src, destDir) => {
    if (!src || !destDir) {
        handleError('Invalid input');
        return;
    }
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
};

export const mv = async (src, destDir) => {
    if (!src || !destDir) {
        handleError('Invalid input');
        return;
    }
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
        handleError();
    }
};

export const rm = async (file) => {
    if (!file) {
        handleError('Invalid input');
        return;
    }
    const filePath = getPath(file);
    try {
        await fs.promises.access(filePath);
        await fs.promises.unlink(filePath);
    }
    catch {
        handleError();
    }
};

import fs from 'fs';
import crypto from 'crypto';
import { getPath, handleError } from '../helpers/helpers.js';

export const calcHash = async (file) => {
    const filePath = getPath(file);
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
        handleError();
    }
}
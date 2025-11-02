import fs from 'fs';
import path from 'path';
import { getWorkingDir, setWorkingDir, getPath, handleError } from '../helpers/helpers.js';

export async function up() {
    const workingDir = getWorkingDir();
    const parentDir = path.dirname(workingDir);
    if (parentDir !== workingDir) setWorkingDir(parentDir);
}

export async function cd(targetArg) {
    if (!targetArg) return handleError('Invalid input');

    let targetPath = path.isAbsolute(targetArg)
        ? targetArg
        : getPath(targetArg);

    try {
        const stat = await fs.promises.stat(targetPath);
        if (!stat.isDirectory()) {
            handleError('Invalid input');
        }
        setWorkingDir(targetPath);
    } catch {
        handleError();
    }
}

export async function ls() {
    const workingDir = getWorkingDir();
    const items = await fs.promises.readdir(workingDir, { withFileTypes: true });
    const folders = items.filter(i => i.isDirectory()).map(i => ({ Name: i.name, Type: 'directory' }));
    const files = items.filter(i => i.isFile()).map(i => ({ Name: i.name, Type: 'file' }));
    const list = [...folders.sort((a,b)=>a.Name.localeCompare(b.Name)),
                    ...files.sort((a,b)=>a.Name.localeCompare(b.Name))];
    console.table(list);
}
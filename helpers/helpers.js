import os from 'os';
import path from 'path';

let workingDir = os.homedir();
export const getWorkingDir = () => workingDir;
export const setWorkingDir = (newDir) => {
  workingDir = newDir;
};
export const getPath = (p) => path.resolve(workingDir, p);
export const handleError = (msg = 'Operation failed') => console.log(msg);
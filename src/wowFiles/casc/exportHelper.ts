/*!
    Based on code from:
	
	wow.export (https://github.com/Kruithne/wow.export)
	Authors: Kruithne <kruithne@gmail.com>
	License: MIT
 */
import path from 'node:path';
    
export const replaceExtension = (file: string, ext = '') => {
    return path.join(path.dirname(file), path.basename(file, path.extname(file)) + ext);
}
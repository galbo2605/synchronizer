import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export abstract class FilesBLL {
	public static getOutgoingFilePaths(path: string) {
		return new Promise<string[]>((resolve, reject) => {
			const results = walk(path, path, []);
			// console.log(results);
			resolve(results);
		});
	}

}

function walk(mainPath: string, dir: string, items) {
	try {
		const results = items;
		const list = readdirSync(dir);
		list.forEach(item => {
			const path = `${dir}\\${item}`;
			const statCB = statSync(path);
			// if item is directory
			if (statCB.isDirectory()) {
				walk(mainPath, path, results);
				// if file not dir
			} else {
				const file = item;
				const dirPath = dir.replace(mainPath, '').trim();
				const subDirs = dirPath.split('\\');
				subDirs.shift(); // remove '' as a first item
				const result = { path, file: join(dirPath, file), subDirs };
				results.push(result);
			}
		});
		return results;
	} catch (err) {
		console.log(err);
		return [];
	}
}

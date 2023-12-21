import * as https from 'https';
import * as fs from 'fs';

import { createHash } from 'crypto';
import assert from 'node:assert/strict';

const checkFileChecksum = (path: string, checksum: string) => {
	const buff = fs.readFileSync(path);
	const hash = createHash('sha256').update(buff).digest('hex');
	assert.deepEqual(hash, checksum);
};

export const download = async (path: string, url: string, checksum: string) => {
	if (fs.existsSync(path)) {
		checkFileChecksum(path, checksum);
		console.log(`File ${path} exists... skipping`);

		return;
	}

	const file = fs.createWriteStream(path);

	console.log(`Downloading ${path}`);

	https.get(url, (response) => {
		response.pipe(file);
		file.on('finish', () => {
			file.close();

			checkFileChecksum(path, checksum);
		});
	});

	console.log(`Completed ${path}`);
};

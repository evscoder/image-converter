import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const configPath = 'src-tauri/tauri.conf.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
let version;

if (process.env.GITHUB_REF_TYPE === 'tag') {
    version = (process.env.GITHUB_REF_NAME || '').replace(/^v/, '');
} else {
    if (!stableVersion.test(config.version)) throw new Error('Expected a stable base version in tauri.conf.json');
    const run = process.env.GITHUB_RUN_NUMBER || '';
    if (!/^[1-9]\d*$/.test(run)) throw new Error('GITHUB_RUN_NUMBER must be a positive integer');
    const [major, minor, patch] = config.version.split('.').map(Number);
    version = `${major}.${minor}.${patch + Number(run)}`;
}

if (!stableVersion.test(version)) throw new Error(`Invalid release version: ${version}`);
const parts = version.split('.').map(Number);
if (parts.some((part, index) => !Number.isSafeInteger(part) || part > [255, 255, 65535][index])) {
    throw new Error(`Version exceeds Windows MSI limits: ${version}`);
}

config.version = version;
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
console.log(`Installer version: ${version}`);

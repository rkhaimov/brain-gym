import path from 'path';
import fs from 'fs';
import { IPackageJSON, IPackageParser } from './types';

export class PackageParser implements IPackageParser {
    constructor(private packagePath: string, private setupPath: string) {}

    copyClientPresets(): void {
        this.getPaths().CLIENT.forEach(this.copyToPackage);
    }

    copyServerPresets(): void {
        this.getPaths()
            .SERVER.forEach(this.copyToPackage);
    }

    getPackageJSON(): IPackageJSON {
        return require(path.resolve(this.packagePath, 'package.json'));
    }

    private copyToPackage = (configPath: string) => {
        return fs.copyFileSync(configPath, path.resolve(this.packagePath, path.basename(configPath)));
    }

    private getPaths() {
        const BASE = path.resolve(this.setupPath, 'presets');

        return {
            SERVER: [
                path.resolve(BASE, 'server', 'Dockerfile'),
                path.resolve(BASE, 'server', 'tsconfig.json'),
                path.resolve(BASE, 'server', 'tslint.json'),
                path.resolve(BASE, 'jest.config.js'),
            ],
            CLIENT: [
                path.resolve(BASE, 'client', 'tsconfig.json'),
                path.resolve(BASE, 'client', 'tslint.json'),
                path.resolve(BASE, 'jest.config.js'),
            ],
        };
    }
}

export interface IPackageParser {
    getPackageJSON(): IPackageJSON;
    copyServerPresets(): void;
    copyClientPresets(): void;
}

export interface IPackageJSON { type: PackageType; }

export enum PackageType {
    Server = 'server',
    Client = 'client',
}

import { IPackageParser, PackageType } from './types';

export class Setup {
    constructor(private parser: IPackageParser) {}

    do() {
        if (this.isServerPackage()) {
            this.parser.copyServerPresets();

            return;
        }

        this.parser.copyClientPresets();
    }

    private isServerPackage() {
        const type = this.parser.getPackageJSON().type;

        if (!type) {
            throw new Error(`Please specify package type with values ${PackageType.Server} or ${PackageType.Client} in type field`);
        }

        return type === PackageType.Server;
    }
}

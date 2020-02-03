import { Setup } from './src/Setup';
import { IPackageJSON, IPackageParser, PackageType } from './src/types';

describe('After installing procedure it is determining package purpose and setups all necessary configurations', () => {
    it('should copy files from certain presets folder to packages folder', () => {
        const { parser, setup } = initialize();
        parser.getPackageJSON.mockReturnValue({ type: PackageType.Server } as IPackageJSON);

        setup.do();

        expect(parser.copyServerPresets).toHaveBeenCalled();
        expect(parser.copyClientPresets).not.toHaveBeenCalled();
    });

    it('should setup client', () => {
        const { parser, setup } = initialize();
        parser.getPackageJSON.mockReturnValue({ type: PackageType.Client } as IPackageJSON);

        setup.do();

        expect(parser.copyClientPresets).toHaveBeenCalled();
        expect(parser.copyServerPresets).not.toHaveBeenCalled();
    });

    it('should throw when type does not exists', () => {
        const { parser, setup } = initialize();
        parser.getPackageJSON.mockReturnValue({});

        expect(() => setup.do()).toThrow();
    });
});

function initialize() {
    const parser = new PackageParser();

    return {
        parser,
        setup: new Setup(parser),
    };
}

class PackageParser implements IPackageParser {
    getPackageJSON = jest.fn();
    copyClientPresets = jest.fn();
    copyServerPresets = jest.fn();
}

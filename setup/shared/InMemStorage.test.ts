import { InMemStorage } from './InMemStorage';
import { genString } from './test-utils';

describe('InMemStorage provide means to store and retrieve information', () => {
    it('should set and get values', async () => {
        const storage = new InMemStorage<{ key: string }>();
        const expected = genString();

        await storage.set('key', expected);

        expect(await storage.get('key')).toBe(expected);
    });

    it('should allow to initial values', async () => {
        const expected = genString();
        const storage = new InMemStorage<{ key: string }>({ key: expected });

        expect(await storage.get('key')).toBe(expected);
    });
});

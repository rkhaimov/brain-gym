import { IStorage } from './types';

export class InMemStorage<TStorage = {}> implements IStorage<TStorage> {
    private store: { [key: string]: unknown } = {};

    constructor(initial?: Partial<TStorage>) {
        if (initial) {
            this.store = initial;
        }
    }

    set(key: keyof TStorage, value: unknown) {
        this.store[key as string] = value;

        return Promise.resolve();
    }

    get<TKey extends keyof TStorage>(key: TKey) {
        const value = this.store[key as string] as TStorage[TKey];

        return Promise.resolve(value);
    }
}

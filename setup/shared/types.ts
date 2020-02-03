export interface IStorage<TStorage> {
    set(key: keyof TStorage, value: unknown): Promise<void>;
    get<TKey extends keyof TStorage>(key: TKey): Promise<TStorage[TKey]>;
}

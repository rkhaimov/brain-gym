import { MetaDictionary } from 'errors-meta-dictionary';

export type Dictionary = Partial<
  {
    [TKey in keyof MetaDictionary]: (params: MetaDictionary[TKey]) => string;
  }
>;
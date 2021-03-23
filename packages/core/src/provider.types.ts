import { ReadonlyStore } from './store.types';

export interface ValueProvider<T> {
    key?: string;

    getValue(state: ReadonlyStore): T;
}

export type ValueProviders<T extends any[]> = {
    [K in keyof T]: ValueProvider<T[K]>;
}

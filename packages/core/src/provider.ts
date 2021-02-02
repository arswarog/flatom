import { ReadonlyStore } from './store.types';

export interface ValueProvider<T> {
    getValue(state: ReadonlyStore): T;
}

export type ValueProviders<T extends ReadonlyArray<any>> = {
    [K in keyof T]: ValueProvider<T[K]>
}

export type UnProv<T> = T extends ValueProvider<infer U> ? U : never;

import { ReadonlyStore } from './store.types';

export interface StateProvider<T> {
    getState(state: ReadonlyStore): T;
}

export type UnProv<T> = T extends StateProvider<infer U> ? U : never;

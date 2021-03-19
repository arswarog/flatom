import { ReadonlyStore } from './store.types';
import { AnyAction } from './declareAction';
import { AtomName } from './declareAtom';
import { Subscription } from './common';
import { ValueProvider, ValueProviders } from './provider';
export interface Store extends ReadonlyStore {
    setState(newState: Record<AtomName, any>, type?: string): Record<AtomName, any>;
    dispatch(action: AnyAction): Promise<any>;
    resolve<T extends any>(provider: ValueProvider<T>): T;
    resolveAll<T extends ReadonlyArray<any>>(...providers: ValueProviders<T>): T;
    onGarbageCollected(cb: () => void): Subscription;
}
export declare function createStore(initialState?: Record<AtomName, any>): Store;

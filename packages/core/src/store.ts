import { ReadonlyStore } from './store.types';
import { AnyAction } from './declareAction';
import { Subscription, Unsubscribe } from './common';
import { ServiceStore } from './service';
import { StateProvider } from './provider';

export interface Store extends ReadonlyStore {
    dispatch(action: AnyAction): Promise<any>;

    runService(
        factory: (store: ServiceStore) => void | Unsubscribe,
    ): Subscription;

    runService(
        providers: [],
        factory: (store: ServiceStore) => void | Unsubscribe,
    ): Subscription;

    runService<T1>(
        providers: [
            StateProvider<T1>
        ],
        factory: (
            store: ServiceStore,
            provider1: T1,
        ) => void | Unsubscribe,
    ): Subscription;

    runService<T1, T2>(
        providers: [
            StateProvider<T1>,
            StateProvider<T2>
        ],
        factory: (
            store: ServiceStore,
            provider1: T1,
            provider2: T2,
        ) => void | Unsubscribe,
    ): Subscription;
}

export function createStore(): Store {
    return {} as any;
}

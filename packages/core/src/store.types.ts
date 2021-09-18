import { Atom, AtomName } from './atom.types';
import { ActionCreator, AnyAction, PayloadActionCreator } from './action.types';
import { Subscription } from './common';
import { Resolver } from './resolver.types';

export type StateSubscription = (state: Record<AtomName, any>, action: AnyAction) => void;
export type StoreSubscription = (state: Record<AtomName, any>) => void;

export interface ReadonlyStore {
    getState(): Record<string, any>;

    getState<TAtom>(atom: Atom<TAtom>): Readonly<TAtom>;

    getState<T, TAtom>(atom: Atom<TAtom>, selector?: (state: TAtom) => T): Readonly<T>;

    subscribe(cb: StoreSubscription): Subscription;

    subscribe<T>(action: ActionCreator<T>, cb: () => void): Subscription;

    subscribe<T>(action: ActionCreator<T>, cb: (payload: T) => void): Subscription;

    subscribe<T>(action: PayloadActionCreator<T>, cb: (payload: T) => void): Subscription;

    subscribe<T>(target: Atom<T> | ActionCreator<T>, cb: (state: T) => void): Subscription;

    resolve<T>(provider: ValueProvider<T>): T;
}

export interface Store extends ReadonlyStore {
    resolver: Resolver;

    setState(newState: Record<AtomName, any>, type?: string): Record<AtomName, any>;

    dispatch(action: AnyAction): Promise<any>;

    onGarbageCollected(cb: () => void): Subscription;

    runService(service: (store: Store) => () => void): Unsubscribe;

    debugAPI: DebugAPI;
}

interface DebugAPI {
    onStateChanged(cb: StateSubscription): Subscription;
}

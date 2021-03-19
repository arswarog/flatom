import { Atom, AtomName } from './declareAtom';
import { ActionCreator, AnyAction, AnyActionCreator, PayloadActionCreator } from './declareAction';
import { Subscription } from './common';
import { ValueProvider, ValueProviders } from './provider';

export type StoreSubscription = (state: Record<AtomName, any>, action: AnyAction) => void;

export interface ReadonlyStore {
    getState(): Record<string, any>;

    getState<TAtom>(atom: Atom<TAtom>): Readonly<TAtom>;

    getState<T, TAtom>(atom: Atom<TAtom>, selector?: (state: TAtom) => T): Readonly<T>;

    subscribe(cb: StoreSubscription): Subscription;

    subscribe<T>(action: AnyActionCreator<T>, cb: () => void): Subscription;

    subscribe<T>(action: ActionCreator<T>, cb: (payload: T) => void): Subscription;

    subscribe<T>(action: PayloadActionCreator<T>, cb: (payload: T) => void): Subscription;

    subscribe<T>(target: Atom<T> | AnyActionCreator<T>, cb: (state: T) => void): Subscription;
}

export interface Store extends ReadonlyStore {
    setState(newState: Record<AtomName, any>, type?: string): Record<AtomName, any>;

    dispatch(action: AnyAction): Promise<any>;

    resolve<T extends any>(provider: ValueProvider<T>): T;

    resolveAll<T extends ReadonlyArray<any>>(providers: ValueProviders<T>): T;

    onGarbageCollected(cb: () => void): Subscription;
}

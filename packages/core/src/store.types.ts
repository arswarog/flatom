import { Atom } from './declareAtom';
import { ActionCreator, AnyActionCreator, PayloadActionCreator } from './declareAction';
import { Subscription } from './common';

export interface ReadonlyStore {
    getState(): Record<string, any>;

    getState<T>(atom: Atom<T>): Readonly<T>;

    subscribe<T>(action: AnyActionCreator<T>, cb?: () => void): Subscription;

    subscribe<T>(action: ActionCreator<T>, cb?: (payload: T) => void): Subscription;

    subscribe<T>(action: PayloadActionCreator<T>, cb?: (payload: T) => void): Subscription;

    subscribe<T>(target: Atom<T> | AnyActionCreator<T>, cb?: (state: T) => void): Subscription;
}

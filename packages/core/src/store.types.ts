import { Atom } from './declareAtom';
import { ActionCreator } from './declareAction';
import { Subscription } from './common';

export interface ReadonlyStore {
    getState<T>(atom: Atom<T>): T;

    subscribe<T>(target: Atom<T> | ActionCreator<T>, cb?: (state: T) => void): Subscription;

    subscribe<T>(action: ActionCreator<T>, cb?: (payload: T) => void): Subscription;
}

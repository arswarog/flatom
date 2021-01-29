import { Atom } from './declareAtom';
import { ActionCreator } from './declareAction';
import { Subscription } from './common';
import { StateProvider } from './provider';

export interface ReadonlyStore {
    getState<T>(atom: Atom<T>): T;

    subscribe<T>(target: Atom<T> | ActionCreator<T>, cb?: (state: T) => void): Subscription;

    subscribe<T>(action: ActionCreator<T>, cb?: (payload: T) => void): Subscription;

    subscribe<T>(action: ActionCreator<T>, providers: [], cb?: (payload: T) => void): Subscription;

    subscribe<T, T1>(action: ActionCreator<T>, providers: [
        StateProvider<T1>
    ], cb?: (action: T, p1: T1) => void): Subscription;

    subscribe<T, T1, T2>(action: ActionCreator<T>, providers: [
        StateProvider<T1>,
        StateProvider<T2>
    ], cb?: (action: T, p1: T1, p2: T2) => void): Subscription;
}

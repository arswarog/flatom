import { Atom, AtomName } from './atom.types';
import { ActionCreator, Action, PayloadActionCreator, PayloadlessActionCreator, PayloadAction } from './action.types';
import { Subscription } from './common';
import { Resolver } from './resolver.types';

export type State = Record<string | symbol, any>;
export type StateSubscription = (state: Record<AtomName, any>, action: Action) => void;
export type DispatchSubscription = (action: Action) => void;

export interface ReadonlyStore {
    getState(): Record<string, any>;

    getState<TAtom>(atom: Atom<TAtom>): Readonly<TAtom>;

    getState<T, TAtom>(atom: Atom<TAtom>, selector?: (state: TAtom) => T): Readonly<T>;

    subscribe(cb: DispatchSubscription): Subscription;

    subscribe(action: ActionCreator | PayloadlessActionCreator, cb: () => void): Subscription;

    subscribe<T = unknown>(
        target: Atom<T> | ActionCreator | PayloadActionCreator<T>,
        cb: (payload: T) => void,
    ): Subscription;

    getService: Resolver['get'];
}

export interface Store extends ReadonlyStore {
    resolver: Resolver;

    setState(newState: Record<AtomName, any>, actionType?: string): Record<AtomName, any>;

    dispatch<T extends PayloadAction<any, any>>(action: T): Promise<ResultOfPayloadAction<T>>;
    dispatch(action: Action): Promise<void>;

    onGarbageCollected(cb: () => void): Subscription;

    debugAPI: DebugAPI;
}

interface DebugAPI {
    onStateChanged(cb: StateSubscription): Subscription;
}

export interface FlatomConfig {
    trace?: boolean;
}

type ResultOfPayloadAction<T extends PayloadAction<any, any>> = T extends PayloadAction<any, infer R> ? R : void;

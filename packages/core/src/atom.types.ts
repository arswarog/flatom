import { Action, PayloadActionCreator, PayloadlessActionCreator } from './action.types';

export type AtomName = string;

export interface Atom<TState> {
    readonly key: AtomName;

    readonly relatedAtoms: ReadonlyArray<Atom<any>>;

    readonly discoveredActions: ReadonlyArray<string>;

    readonly hasOtherReducer: boolean;

    (state: TState | undefined, action: Action): TState;

    <T>(state: TState | undefined, action: { type: Atom<T>; payload: T }): TState;
}

export type Reducers<TState, TActions extends Record<string, any>> = {
    [key in keyof TActions]: (state: TState, payload: TActions[key]) => TState;
};

export type ActionCreators<TActions extends Record<string, any>> = {
    // [key in keyof TActions]: PayloadActionCreator<TActions[key]>;
    [key in keyof TActions]: TActions[key] extends void
        ? PayloadlessActionCreator
        : PayloadActionCreator<TActions[key]>;
};

export interface AtomWithActionCreators<TState, TActions> extends Atom<TState> {
    actions: ActionCreators<TActions>;
    a: ActionCreators<TActions>;
}

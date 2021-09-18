import { ValueProvider } from './provider.types';
import { Action, AnyAction } from './action.types';

export type AtomName = string;

export interface Atom<TState> extends ValueProvider<TState> {
    readonly key: AtomName;

    readonly relatedAtoms: ReadonlyArray<Atom<any>>;

    readonly discoveredActions: ReadonlyArray<string>;

    readonly hasOtherReducer: boolean;

    (state: TState | undefined, action: AnyAction): TState;

    <T>(state: TState | undefined, action: { type: Atom<T>, payload: T }): TState;
}

export type Reducers<TState, TActions extends {}> = {
    [key in keyof TActions]: (state: TState, payload: TActions[key]) => TState;
}

export type ActionCreators<TActions extends {}> = {
    [key in keyof TActions]: (payload: TActions[key]) => Action;
}

export type AtomWithActionCreators<TState, TActions> = Atom<TState> & ActionCreators<TActions>

import { ValueProvider } from './provider.types';
import { AnyAction } from './action.types';

export type AtomName = string; // fixme: string | symbol;

export interface Atom<TState> extends ValueProvider<TState> {
    readonly key: AtomName;

    readonly relatedAtoms: ReadonlyArray<Atom<any>>;

    readonly discoveredActions: ReadonlyArray<string>;

    readonly hasOtherReducer: boolean;

    (state: TState | undefined, action: AnyAction): TState;

    <T>(state: TState | undefined, action: { type: Atom<T>, payload: T }): TState;
}

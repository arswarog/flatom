import { ValueProvider } from './provider';
import { AnyAction } from './declareAction';

export type AtomName = string; // fixme: string | symbol;

export interface Atom<TState> extends ValueProvider<TState> {
    readonly atomName: AtomName;

    readonly relatedAtoms: ReadonlyArray<Atom<any>>;

    (state: TState | undefined, action: AnyAction): TState;

    <T>(state: TState | undefined, action: { type: Atom<T>, payload: T }): TState;
}

import { AnyAction, ActionCreator, PayloadActionCreator, ActionCreatorWithParams } from './declareAction';
import { PayloadReducer } from './common';
import { ValueProvider } from './provider';
export declare type AtomName = string;
export interface Atom<TState> extends ValueProvider<TState> {
    readonly atomName: AtomName;
    readonly relatedAtoms: ReadonlyArray<Atom<any>>;
    (state: TState | undefined, action: AnyAction): TState;
    <T>(state: TState | undefined, action: {
        type: Atom<T>;
        payload: T;
    }): TState;
}
interface ReducerCreator<TState> {
    <TPayload>(actionCreator: ActionCreator<TPayload> | PayloadActionCreator<TPayload> | ActionCreatorWithParams<TPayload, any>, reducer: PayloadReducer<TState, TPayload>): void;
    <TPayload>(atom: Atom<TPayload>, reducer: PayloadReducer<TState, TPayload>): void;
    other<TPayload>(reducer: (state: TState, action: AnyAction<TPayload>) => TState): void;
}
export declare function declareAtom<TState extends object>(atomName: AtomName, initialState: TState, reducerCreator: (on: ReducerCreator<TState>) => void): Atom<TState>;
export declare function isAtom<T>(target: any): target is Atom<T>;
export {};

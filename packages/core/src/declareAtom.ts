import { AnyAction, ActionCreator, isActionCreator } from './declareAction';
import { PayloadReducer, TargetId } from './common';
import { StateProvider } from './provider';

const atomSymbol = Symbol('Atom');

export type AtomName = string | Symbol;

export interface Atom<TState> extends StateProvider<TState> {
    readonly [atomSymbol]: Symbol;

    readonly atomName: AtomName;

    (state: TState, action: AnyAction): TState;
}

interface ReducerCreator<TState> {
    <TPayload>(actionCreator: ActionCreator<TPayload>, reducer: PayloadReducer<TState, TPayload>): void;

    <TPayload>(atom: Atom<TPayload>, reducer: PayloadReducer<TState, TPayload>): void;
}

export function declareAtom<TState extends object>(
    atomName: AtomName,
    initialState: TState,
    reducerCreator: (on: ReducerCreator<TState>) => void,
): Atom<TState> {
    const reducers: Map<string | Atom<any>, PayloadReducer<TState, any>> = new Map();

    let other: PayloadReducer<TState, any>;

    const on: ReducerCreator<TState> = <T>(target: Atom<any> | ActionCreator<any>, reducer: PayloadReducer<TState, T>) => {
        if (isAtom(target))
            reducers.set(target, reducer);
        else if (isActionCreator(target))
            reducers.set(target.type, reducer);
        else
            throw new Error('Invalid target');
    };

    reducerCreator(on);

    const atom: any = (state: TState, action: AnyAction | { atom: Atom<any>, state: any }) => {
        if ('type' in action) {
            const reducer = reducers.get(action.type);
            return reducer
                ? reducer(state, action.payload)
                : state;
        } else if ('atom' in action) {
            const reducer = reducers.get(action.atom);
            return reducer
                ? reducer(state, action.state)
                : state;
        } else
            throw new Error('Invalid action');
    };
    atom.atomName = atomName;
    atom[atomSymbol] = atomSymbol;
    return atom;
}

export function isAtom<T>(target: any): target is Atom<T> {
    return target[atomSymbol] === atomSymbol;
}

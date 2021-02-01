import {
    AnyAction,
    ActionCreator,
    isActionCreator,
    PayloadActionCreator,
    ActionCreatorWithParams,
} from './declareAction';
import { PayloadReducer, TargetId } from './common';
import { StateProvider } from './provider';

const atomSymbol = Symbol('Atom');

export type AtomName = string | Symbol;

export interface Atom<TState> extends StateProvider<TState> {
    readonly [atomSymbol]: Symbol;

    readonly atomName: AtomName;

    (state: TState | undefined, action: AnyAction): TState;
}

interface ReducerCreator<TState> {
    <TPayload>(actionCreator: ActionCreator<TPayload> | PayloadActionCreator<TPayload> | ActionCreatorWithParams<TPayload, any>, reducer: PayloadReducer<TState, TPayload>): void;

    <TPayload>(atom: Atom<TPayload>, reducer: PayloadReducer<TState, TPayload>): void;

    other<TPayload>(reducer: (state: TState, action: AnyAction<TPayload>) => TState): void;
}

export function declareAtom<TState extends object>(
    atomName: AtomName,
    initialState: TState,
    reducerCreator: (on: ReducerCreator<TState>) => void,
): Atom<TState> {
    const reducers: Map<string | Atom<any>, PayloadReducer<TState, any>> = new Map();

    let other: PayloadReducer<TState, any> | undefined;

    const on: any = <T>(target: Atom<any> | ActionCreator<any>, reducer: PayloadReducer<TState, T>) => {
        if (isAtom(target)) {
            if (reducers.has(target))
                throw new Error(`Reaction for atom "${target.atomName}" already set`);
            reducers.set(target, reducer);
        } else if (isActionCreator(target)) {
            if (reducers.has(target.type))
                throw new Error(`Reaction for action "${target.type}" already set`);
            reducers.set(target.type, reducer);
        } else
            throw new Error('Invalid target');
    };
    on.other = <TPayload>(reducer: (state: TState, action: AnyAction<TPayload>) => TState) => {
        if (other)
            throw new Error('on.other already set');

        other = reducer;
    };

    reducerCreator(on);

    const atom: any = (state: TState, action: AnyAction | { atom: Atom<any>, state: any }) => {
        if (!state)
            state = initialState;

        if ('type' in action) {
            const reducer = reducers.get(action.type);
            return reducer
                ? reducer(state, action.payload)
                : other
                    ? other(state, action)
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

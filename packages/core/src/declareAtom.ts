import {
    AnyAction,
    ActionCreator,
    isActionCreator, PayloadActionCreator, ActionCreatorWithParams,
} from './declareAction';
import { PayloadReducer } from './common';
import { Store } from './store.types';
import { Atom, AtomName } from './atom.types';

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
    const relatedAtoms: Atom<any>[] = [];

    let other: PayloadReducer<TState, any> | undefined;

    const on: any = <T>(target: Atom<any> | ActionCreator<any>, reducer: PayloadReducer<TState, T>) => {
        if (isAtom(target)) {
            if (reducers.has(target))
                throw new Error(`Reaction for atom "${target.atomName}" already set`);
            relatedAtoms.push(target);
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

    const atom: any = (state: TState, {type, payload}: AnyAction | { type: Atom<any>, payload: any }) => {
        if (!type)
            return state || initialState;

        if (isAtom(type)) {
            const reducer = reducers.get(type);
            return reducer
                ? reducer(state || initialState, payload)
                : state;
        } else {
            const reducer = reducers.get(type);
            return reducer
                ? reducer(state || initialState, payload)
                : other
                    ? other(state || initialState, {type, payload})
                    : state || initialState;
        }
    };
    atom.atomName = atomName;
    atom.relatedAtoms = relatedAtoms;
    atom.getValue = (store: Store) => store.getState(atom);
    return atom;
}

export function isAtom<T>(target: any): target is Atom<T> {
    return typeof target === 'function' && typeof target.atomName === 'string';
}

import {
    ActionCreator, AnyAction,
    PayloadActionCreator,
} from './action.types';
import { PayloadReducer } from './common';
import { Store } from './store.types';
import { ActionCreators, Atom, AtomName, Reducers } from './atom.types';
import { declareAction, isActionCreator } from './declare-action';

interface ReducerCreator<TState> {
    <TPayload>(actionCreator: ActionCreator<TPayload> | PayloadActionCreator<TPayload, any>, reducer: PayloadReducer<TState, TPayload>): void;

    <TPayload>(atom: Atom<TPayload>, reducer: PayloadReducer<TState, TPayload>): void;

    other<TPayload>(reducer: (state: TState, action: AnyAction<TPayload>) => TState): void;
}

// todo unset key, unset initialState
export function declareAtom<TState, TActions = {}>(
    key: AtomName | (string | number)[],
    initialState: TState | undefined,
    reducerCreator: (on: ReducerCreator<TState>) => void,
    actions?: Reducers<TState, TActions>,
): Atom<TState> & ActionCreators<TActions> {
    if (Array.isArray(key)) {
        key = key.join('/');
    }
    if (typeof key === 'string' && !key.length)
        throw new Error(`AtomName cannot be empty`);

    const reducers: Map<string | Atom<any>, PayloadReducer<TState, any>> = new Map();
    const relatedAtoms: Atom<any>[] = [];
    const discoveredActions: string[] = [];

    let otherReducer: PayloadReducer<TState, any> | undefined;

    const on: any = <T>(target: Atom<any> | ActionCreator<any>, reducer: PayloadReducer<TState, T>) => {
        if (isAtom(target)) {
            if (reducers.has(target))
                throw new Error(`Reaction for atom "${target.key}" already set`);
            relatedAtoms.push(target);
            checkReducer(reducer, target.key);
            reducers.set(target, reducer);
        } else if (isActionCreator(target)) {
            if (reducers.has(target.type))
                throw new Error(`Reaction for action "${target.type}" already set`);
            discoveredActions.push(target.type);
            checkReducer(reducer, target.type);
            reducers.set(target.type, reducer);
        } else
            throw new Error('Invalid target');
    };
    on.other = <TPayload>(reducer: (state: TState | undefined, action: AnyAction<TPayload>) => TState) => {
        if (otherReducer)
            throw new Error('on.other already set');

        checkReducer(reducer);

        otherReducer = reducer;
    };

    reducerCreator(on);

    const atom: any = (state: TState, {type, payload}: AnyAction | { type: Atom<any>, payload: any }) => {
        if (!type)
            return state || initialState;

        if (isAtom(type)) {
            const reducer = reducers.get(type);
            return reducer
                ? reducer(state || initialState!, payload)
                : state;
        } else {
            const reducer = reducers.get(type);
            return reducer
                ? reducer(state || initialState!, payload)
                : otherReducer
                    ? otherReducer(state || initialState!, {type, payload})
                    : state || initialState;
        }
    };
    atom.key = key;
    atom.relatedAtoms = relatedAtoms;
    atom.discoveredActions = discoveredActions;
    atom.hasOtherReducer = !!otherReducer;
    atom.getValue = (store: Store) => store.getState(atom);

    const actionsMap = {} as ActionCreators<TActions>;

    if (actions) {
        if (typeof actions !== 'object')
            throw new Error('"actions" must be an object');

        Object.keys(actions).forEach(actionKey => {
            const action = declareAction([key + ':' + actionKey]);
            if (actionKey in atom)
                throw new Error(`Can not create builtIn action with key "${actionKey}": key already exists`);
            else
                atom[actionKey] = action;
            const reducer = actions[actionKey];
            checkReducer(reducer);
            on(action, reducer);
        });
    }

    return atom;
}

export function isAtom<T>(target: any): target is Atom<T> {
    return typeof target === 'function' && (typeof target.key === 'string' || typeof target.key === 'symbol');
}

function checkReducer(target: (state: any, action?: any) => any, key?: string): void {
    if (typeof target === 'function')
        return;
    if (key)
        throw new Error(`Invalid reducer for target "${key}"`);
    else
        throw new Error(`Invalid reducer`);
}

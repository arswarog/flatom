import { ActionCreator, Action, PayloadActionCreator } from './action.types';
import { PayloadReducer } from './common';
import { Store } from './store.types';
import { ActionCreators, Atom, AtomName, AtomWithActionCreators, Reducers } from './atom.types';
import { declareAction, isActionCreator } from './declare-action';

interface ReducerCreator<TState> {
    <TPayload>(
        actionCreator: ActionCreator<TPayload> | PayloadActionCreator<TPayload, any>,
        reducer: PayloadReducer<TState, TPayload>,
    ): void;

    <TPayload>(atom: Atom<TPayload>, reducer: PayloadReducer<TState, TPayload>): void;

    other<TPayload>(reducer: (state: TState, action: Action<TPayload>) => TState): void;
}

export function declareAtom<TState>(atomName: AtomName | (string | number)[], initialState?: TState) {
    function privateDeclareReducers<TActions = Record<string, any>>(
        reducerCreator: (on: ReducerCreator<TState>) => void,
        actions?: Reducers<TState, TActions>,
    ): AtomWithActionCreators<TState, TActions> {
        if (Array.isArray(atomName)) {
            atomName = atomName.join('/');
        }
        if (typeof atomName === 'string' && !atomName.length) throw new Error(`AtomName cannot be empty`);

        const reducers: Map<string | Atom<any>, PayloadReducer<TState, any>> = new Map();
        const relatedAtoms: Atom<any>[] = [];
        const discoveredActions: string[] = [];

        let otherReducer: PayloadReducer<TState, any> | undefined;

        const on: any = <T>(target: Atom<any> | ActionCreator<any>, reducer: PayloadReducer<TState, T>) => {
            if (isAtom(target)) {
                if (reducers.has(target)) throw new Error(`Reaction for atom "${target.key}" already set`);
                relatedAtoms.push(target);
                checkReducer(reducer, target.key);
                reducers.set(target, reducer);
            } else if (isActionCreator(target)) {
                if (reducers.has(target.type)) throw new Error(`Reaction for action "${target.type}" already set`);
                discoveredActions.push(target.type);
                checkReducer(reducer, target.type);
                reducers.set(target.type, reducer);
            } else throw new Error('Invalid target');
        };
        on.other = <TPayload>(reducer: (state: TState | undefined, action: Action<TPayload>) => TState) => {
            if (otherReducer) throw new Error('on.other already set');

            checkReducer(reducer);

            otherReducer = reducer;
        };

        reducerCreator(on);

        const atom: any = (state: TState, { type, payload }: Action | { type: Atom<any>; payload: any }) => {
            if (!type) return state || initialState;

            if (isAtom(type)) {
                const reducer = reducers.get(type);
                return reducer ? reducer(state || initialState!, payload) : state;
            } else {
                const reducer = reducers.get(type);
                return reducer
                    ? reducer(state || initialState!, payload)
                    : otherReducer
                    ? otherReducer(state || initialState!, { type, payload })
                    : state || initialState;
            }
        };
        atom.key = atomName;
        atom.relatedAtoms = relatedAtoms;
        atom.discoveredActions = discoveredActions;
        atom.hasOtherReducer = !!otherReducer;
        atom.getValue = (store: Store) => store.getState(atom);

        const actionsMap = {} as ActionCreators<TActions>;

        if (actions) {
            if (typeof actions !== 'object') throw new Error('"actions" must be an object');

            Object.keys(actions).forEach((actionKey) => {
                const action = declareAction([atomName + ':' + actionKey]);
                if (actionKey in actionsMap)
                    throw new Error(`Can not create builtIn action with key "${actionKey}": key already exists`);
                else actionsMap[actionKey] = action;
                const reducer = actions[actionKey];
                checkReducer(reducer);
                on(action, reducer);
            });
        }

        atom.actions = actionsMap;
        atom.a = actionsMap;

        return atom;
    }

    function declareReducers<TActions = Record<string, any>>(
        reducerCreator: (on: ReducerCreator<TState>) => void,
        actions?: Reducers<TState, TActions>,
    ): AtomWithActionCreators<TState, TActions>;
    function declareReducers<TActions = Record<string, any>>(
        actions: Reducers<TState, TActions>,
        reducerCreator?: (on: ReducerCreator<TState>) => void,
    ): AtomWithActionCreators<TState, TActions>;
    function declareReducers<TActions = Record<string, any>>(
        arg1: ((on: ReducerCreator<TState>) => void) | Reducers<TState, TActions>,
        arg2?: ((on: ReducerCreator<TState>) => void) | Reducers<TState, TActions>,
    ): AtomWithActionCreators<TState, TActions> {
        if (!arg1) throw new Error('Invalid parameters in declare atom');
        if (typeof arg1 === 'object')
            return privateDeclareReducers((arg2 as (on: ReducerCreator<TState>) => void) || (() => null), arg1);
        if (typeof arg1 === 'function') return privateDeclareReducers(arg1, arg2 as Reducers<TState, TActions>);
        throw new Error('Invalid parameters in declare atom');
    }

    return declareReducers;
}

export function isAtom<T>(target: any): target is Atom<T> {
    return typeof target === 'function' && (typeof target.key === 'string' || typeof target.key === 'symbol');
}

function checkReducer(target: (state: any, action?: any) => any, key?: string): void {
    if (typeof target === 'function') return;
    if (key) throw new Error(`Invalid reducer for target "${key}"`);
    else throw new Error(`Invalid reducer`);
}

import { ReadonlyStore } from './store.types';
import { AnyAction, AnyActionCreator } from './declareAction';
import { Atom, AtomName, isAtom } from './declareAtom';
import { createSubscription, Subscription } from './common';

export interface Store extends ReadonlyStore {
    dispatch(action: AnyAction): Promise<any>;
}

interface AtomMeta<T = any> {
    atom: Atom<T>;
    subscriptions: ((payload: any) => void)[];
}

export function createStore(): Store {
    let state: Record<AtomName, any> = {};
    let atoms: Atom<any>[] = [];
    let atomSubscriptions = new Map<Atom<any>, Subscription[]>();
    let subscriptions = new Map<any, ((payload: any) => void)[]>();

    function subscribe(target: Atom<any> | AnyActionCreator<any>, cb: (payload?: any) => void = (() => null)): Subscription {
        const subscribeTarget = isAtom(target) ? target : target.type;

        if (!subscriptions.has(subscribeTarget)) {
            subscriptions.set(subscribeTarget, []);

            if (isAtom(target)) {
                atomSubscriptions.set(target, target.relatedAtoms.map(rel => subscribe(rel)));
                atoms.push(target);
            }
        }

        subscriptions.get(subscribeTarget)!.push(cb);

        return createSubscription(() => {
            const list = subscriptions.get(subscribeTarget)!.filter(item => item !== cb);

            if (list.length)
                return subscriptions.set(subscribeTarget, list);

            subscriptions.delete(subscribeTarget);

            if (isAtom(target)) {
                atomSubscriptions.get(target)!.forEach(cb => cb());
                atomSubscriptions.delete(target);
                delete state[target.atomName];
            }
        });
    }

    function dispatch(action: AnyAction): Promise<any> {
        // atoms
        const changedAtoms = new Set<Atom<any>>();

        state = atoms.reduce(
            (accState, atom) => {
                const lastLocalState = accState[atom.atomName];
                let localState = atom.relatedAtoms.reduce((accLocalState, relAtom) => {
                    if (!changedAtoms.has(relAtom))
                        return accLocalState;

                    return atom(accLocalState, {type: relAtom, payload: accState[relAtom.atomName]});
                }, lastLocalState);

                localState = atom(localState, action);
                if (lastLocalState === localState)
                    return accState;

                changedAtoms.add(atom);
                return {
                    ...accState,
                    [atom.atomName]: localState,
                };
            },
            state,
        );

        // atom subscriptions
        changedAtoms.forEach(atom => {
            const cbList = subscriptions.get(atom);
            if (!cbList) return;

            const localState = state[atom.atomName];
            cbList.forEach(cb => cb && cb(localState));
        });

        // action subscriptions
        const cbList = subscriptions.get(action.type);

        if (cbList)
            cbList.forEach(cb => cb(action.payload));

        return Promise.resolve();
    }

    function getState(atom?: Atom<any>): any {
        if (!atom)
            return state;

        return state[atom.atomName] || atom(undefined, {type: ''});
    }

    return {
        subscribe,
        dispatch,
        getState,
    };
}

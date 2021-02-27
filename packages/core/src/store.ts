import { ReadonlyStore } from './store.types';
import { AnyAction, AnyActionCreator } from './declareAction';
import { Atom, AtomName, isAtom } from './declareAtom';
import { createSubscription, Subscription } from './common';
import { ValueProvider, ValueProviders } from './provider';

type StoreSubscription = (state: Record<AtomName, any>, action: AnyAction) => void;

export interface Store extends ReadonlyStore {
    dispatch(action: AnyAction): Promise<any>;

    resolve<T extends any>(provider: ValueProvider<T>): T;

    resolveAll<T extends ReadonlyArray<any>>(...providers: ValueProviders<T>): T;
}

export function createStore(initialState: Record<AtomName, any> = {}): Store {
    let state: Record<AtomName, any> = initialState;
    let atoms: Atom<any>[] = [];
    let storeSubscriptions = new Set<StoreSubscription>();
    let atomSubscriptions = new Map<Atom<any>, Subscription[]>();
    let subscriptions = new Map<any, ((payload: any) => void)[]>();

    function subscribe(cb: StoreSubscription): Subscription;
    function subscribe(target: Atom<any> | AnyActionCreator<any>, cb: (payload?: any) => void): Subscription;
    function subscribe(target: Atom<any> | AnyActionCreator<any> | StoreSubscription, cb?: (payload?: any) => void): Subscription {
        if (cb === void 0) {
            storeSubscriptions.add(target as any);
            return createSubscription(() => storeSubscriptions.delete(target as any));
        }

        const subscribeTarget = isAtom(target) ? target : (target as AnyActionCreator<any>).type;

        if (!subscriptions.has(subscribeTarget)) {
            subscriptions.set(subscribeTarget, []);

            if (isAtom(target)) {
                atomSubscriptions.set(target, target.relatedAtoms.map(rel => subscribe(rel, () => null)));
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

                if (atoms.every(atom => atom.relatedAtoms.indexOf(target) === -1))
                    atoms = atoms.filter(atom => atom !== target);
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

        storeSubscriptions.forEach(cb => cb(state, action));

        return Promise.resolve();
    }

    function getState(atom?: Atom<any>): any {
        if (!atom)
            return state;

        return state[atom.atomName] || atom(undefined, {type: ''});
    }

    const readonlyStore: ReadonlyStore = {
        getState,
        subscribe,
    };

    function resolve<T extends any>(provider: ValueProvider<T>): T {
        return provider.getValue(readonlyStore);
    }

    function resolveAll<T extends ReadonlyArray<any>>(...providers: ValueProviders<T>): T {
        return providers.map(provider => provider.getValue(readonlyStore)) as any;
    }

    return {
        subscribe,
        dispatch,
        getState,
        resolve,
        resolveAll,
    };
}

import { ReadonlyStore, Store, StoreSubscription } from './store.types';
import { AnyAction, AnyActionCreator } from './action.types';
import { Atom, AtomName } from './atom.types';
import { createSubscription, Subscription, Unsubscribe } from './common';
import { ValueProvider, ValueProviders } from './provider.types';
import { isAtom } from './declareAtom';

export function createStore(initialState: Record<AtomName, any> = {}): Store {
    let state: Record<AtomName, any> = initialState;
    let atoms: Atom<any>[] = [];
    let storeSubscriptions = new Set<StoreSubscription>();
    let innerSubscriptions = new Map<Atom<any>, Subscription[]>();
    let subscriptions = new Map<any, ((payload: any) => void)[]>();
    let gcSubscriptions = new Set<Unsubscribe>();
    let gc: Atom<any>[] | null = null;

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
                innerSubscriptions.set(target, target.relatedAtoms.map(rel => subscribe(rel, () => null)));
                atoms.push(target);
                const relatedAtoms = target.relatedAtoms || [];
                state[target.key] = relatedAtoms.reduce(
                    (state, atom) => target(state, {type: atom, payload: getState(atom)}),
                    target(undefined, {type: ''}),
                );
            }
        }

        subscriptions.get(subscribeTarget)!.push(cb);

        return createSubscription(() => {
            const list = subscriptions.get(subscribeTarget)!.filter(item => item !== cb);

            if (list.length)
                return subscriptions.set(subscribeTarget, list);

            subscriptions.delete(subscribeTarget);

            if (isAtom(target))
                removeAtom(target);
        });
    }

    function removeAtom(target: Atom<any>) {
        if (!canRemoveAtom(target))
            return;

        if (gc) {
            gc.push(target);
            delete state[target.key];
            atoms = atoms.filter(item => item !== target);
            innerSubscriptions.get(target)!.forEach(cb => cb());
            innerSubscriptions.delete(target);
        } else {
            gc = [];
            removeAtom(target);
            if (gc.length)
                gcSubscriptions.forEach(cb => cb());
            gc = null;
        }
    }

    function canRemoveAtom(target: Atom<any>) {
        if (subscriptions.has(target))
            return false;
        if (!target.relatedAtoms || !target.relatedAtoms.length)
            return true;
        if (atoms.some(atom => atom.relatedAtoms.indexOf(target) !== -1))
            return false;

        return true;
    }

    function dispatch(action: AnyAction): Promise<any> {
        // atoms
        const changedAtoms = new Set<Atom<any>>();

        state = {...state};

        atoms.forEach(atom => {
            const lastLocalState = state[atom.key];
            let localState = atom.relatedAtoms.reduce((accLocalState, relAtom) => {
                if (!changedAtoms.has(relAtom))
                    return accLocalState;

                return atom(accLocalState, {type: relAtom, payload: state[relAtom.key]});
            }, lastLocalState);

            localState = atom(localState, action);
            if (lastLocalState === localState)
                return state;

            changedAtoms.add(atom);
            state[atom.key] = localState;
        });

        notifyListeners(changedAtoms, action);

        return Promise.resolve();
    }

    function notifyListeners(changedAtoms: Set<Atom<any>>, action: AnyAction) {
        // atom subscriptions
        changedAtoms.forEach(atom => {
            const cbList = subscriptions.get(atom);
            if (!cbList) return;

            const localState = state[atom.key];
            cbList.forEach(cb => cb && cb(localState));
        });

        // action subscriptions
        const cbList = subscriptions.get(action.type);

        if (cbList)
            cbList.forEach(cb => cb(action.payload));

        storeSubscriptions.forEach(cb => cb(state, action));
    }

    function getState(atom?: Atom<any>, selector?: (state: any) => any): any {
        if (!atom)
            return state;

        const atomState = state[atom.key] || atom(undefined, {type: ''});

        if (selector && typeof selector !== 'function') throw new TypeError('[flatom] Invalid selector');

        return selector
            ? selector(atomState)
            : atomState;
    }

    const readonlyStore: ReadonlyStore = {
        getState,
        subscribe,
        resolve,
        resolveAll,
    };

    function resolve<T extends any>(provider: ValueProvider<T>): T {
        return provider.getValue(readonlyStore);
    }

    function resolveAll<T extends ReadonlyArray<any>>(providers: ValueProviders<T>): T {
        return providers.map(provider => provider.getValue(readonlyStore)) as any;
    }

    function setState(newState: Record<AtomName, any>, type = '@@SET_STATE'): Record<AtomName, any> {
        const prepareState: Record<AtomName, any> = {};

        atoms.forEach(atom => prepareState[atom.key] = atom(undefined, {type: ''}));

        state = {
            ...prepareState,
            ...newState,
        };

        notifyListeners(new Set<Atom<any>>(atoms), {type});

        return state;
    }

    function onGarbageCollected(cb: () => void): Subscription {
        gcSubscriptions.add(cb);
        return createSubscription(() => gcSubscriptions.delete(cb));
    }

    return {
        subscribe,
        dispatch,
        getState,
        resolve,
        resolveAll,
        setState,
        onGarbageCollected,
    };
}

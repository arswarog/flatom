import { ReadonlyStore, StateSubscription, Store, DispatchSubscription, FlatomConfig } from './store.types';
import { ActionCreator, Action } from './action.types';
import { Atom, AtomName } from './atom.types';
import { createSubscription, Subscription, Unsubscribe } from './common';
import { isAtom } from './declare-atom';
import { createResolver } from './resolver';

export function createStore(initialState: Record<AtomName, any> = {}, config: FlatomConfig = {}): Store {
    const trace = config.trace ? (msg) => console.log('[flatom] ' + msg) : (msg) => null;

    let state: Record<AtomName, any> = initialState;
    let atoms: Atom<any>[] = [];
    const changedAtoms = new Set<Atom<any>>();
    /**
     * List of immediate state change subscriptions
     */
    const immediateSubscriptions = new Set<StateSubscription>();
    /**
     * List of state changes subscriptions
     */
    const dispatchSubscriptions = new Set<DispatchSubscription>();
    /**
     * List of inner atom to atom subscriptions
     */
    const innerSubscriptions = new Map<Atom<any>, Subscription[]>();
    /**
     * List of targeted subscriptions
     */
    const subscriptions = new Map<any, ((payload: any) => void)[]>();
    /**
     * List of GC subscriptions
     */
    const gcSubscriptions = new Set<Unsubscribe>();
    let gc: Atom<any>[] | null = null;

    const readonlyStore: ReadonlyStore = {
        getState,
        subscribe,
        resolve: null as any,
    };
    const resolver = createResolver();
    readonlyStore.resolve = resolver.get;

    const debugAPI = {
        onStateChanged,
    };

    const store: Store = {
        subscribe,
        dispatch,
        getState,
        resolve: resolver.get,
        setState,
        onGarbageCollected,
        resolver,
        debugAPI,
    };

    function onStateChanged(cb: StateSubscription): Subscription {
        immediateSubscriptions.add(cb);
        return createSubscription(() => immediateSubscriptions.delete(cb));
    }

    function subscribe(cb: DispatchSubscription): Subscription;
    function subscribe(target: Atom<any> | ActionCreator<any>, cb: (payload?: any) => void): Subscription;
    function subscribe(
        target: Atom<any> | ActionCreator<any> | DispatchSubscription,
        cb?: (payload?: any) => void,
    ): Subscription {
        if (cb === void 0) {
            dispatchSubscriptions.add(target as DispatchSubscription);
            return createSubscription(() => dispatchSubscriptions.delete(target as any));
        }

        const subscribeTarget = isAtom(target) ? target : (target as ActionCreator<any>).type;

        if (!subscriptions.has(subscribeTarget)) {
            subscriptions.set(subscribeTarget, []);

            if (isAtom(target)) {
                innerSubscriptions.set(
                    target,
                    target.relatedAtoms.map((rel) => subscribe(rel, () => null)),
                );
                atoms.push(target);
                const relatedAtoms = target.relatedAtoms || [];
                state[target.key] = relatedAtoms.reduce(
                    (state, atom) => target(state, { type: atom, payload: getState(atom) }),
                    target(undefined, { type: '' }),
                );
            }
        }

        subscriptions.get(subscribeTarget)!.push(cb);

        return createSubscription(() => {
            const list = subscriptions.get(subscribeTarget)!.filter((item) => item !== cb);

            if (list.length) return subscriptions.set(subscribeTarget, list);

            subscriptions.delete(subscribeTarget);

            if (isAtom(target)) removeAtom(target);
        });
    }

    function removeAtom(target: Atom<any>) {
        if (!canRemoveAtom(target)) return;

        if (gc) {
            gc.push(target);
            delete state[target.key];
            atoms = atoms.filter((item) => item !== target);
            innerSubscriptions.get(target)!.forEach((cb) => cb());
            innerSubscriptions.delete(target);
        } else {
            gc = [];
            removeAtom(target);
            if (gc.length) gcSubscriptions.forEach((cb) => cb());
            gc = null;
        }
    }

    function canRemoveAtom(target: Atom<any>) {
        if (subscriptions.has(target)) return false;
        if (!target.relatedAtoms || !target.relatedAtoms.length) return true;
        if (atoms.some((atom) => atom.relatedAtoms.indexOf(target) !== -1)) return false;

        return true;
    }

    function dispatch(action: Action): Promise<any> {
        trace(`dispatch action "${action.type}"`);

        // atoms
        const newState = { ...state };

        let isStateChanged = false;
        atoms.forEach((atom) => {
            const lastLocalState = newState[atom.key];
            let localState = atom.relatedAtoms.reduce((accLocalState, relAtom) => {
                if (!changedAtoms.has(relAtom)) return accLocalState;

                return atom(accLocalState, {
                    type: relAtom,
                    payload: newState[relAtom.key],
                });
            }, lastLocalState);

            localState = atom(localState, action);
            if (Object.is(lastLocalState, localState)) return newState;

            changedAtoms.add(atom);
            newState[atom.key] = localState;
            isStateChanged = true;
        });

        if (isStateChanged) {
            state = newState;
        }

        immediateSubscriptions.forEach((cb) => cb(state, action));

        trace(`run reaction for "${action.type}"`);
        const result = action.reaction && action.reaction(store, action.payload);

        notifyStoreListeners(action);
        notifyAtomListeners();
        notifyActionListeners(action);

        return Promise.resolve(result);
    }

    function notifyStoreListeners(action: Action) {
        dispatchSubscriptions.forEach((cb) => cb(action));
    }

    function notifyActionListeners(action: Action) {
        const cbList = subscriptions.get(action.type);

        trace(`notify action "${action.type}" subscribers`);
        if (cbList) Promise.all(cbList!.map((cb) => cb(action.payload)));
    }

    function notifyAtomListeners() {
        const changes: string[] = [];
        if (config.trace)
            changedAtoms.forEach((item) => changes.push(typeof item.key === 'symbol' ? '[symbol]' : String(item.key)));

        trace(`notifyAtomListeners: run, changes: ${changes}`);

        if (!changedAtoms.size)
            //todo
            return;

        // atom subscriptions
        changedAtoms.forEach((atom) => {
            const cbList = subscriptions.get(atom);
            if (!cbList) return;

            const atomState = state[atom.key];
            cbList.forEach((cb) => cb && cb(atomState));
        });

        changedAtoms.clear();
        return Promise.resolve();
    }

    function getState(atom?: Atom<any>, selector?: (state: any) => any): any {
        if (!atom) return state;

        const atomState = state[atom.key] || atom(undefined, { type: '' });

        if (selector && typeof selector !== 'function') throw new TypeError('[flatom] Invalid selector');

        return selector ? selector(atomState) : atomState;
    }

    function setState(newState: Record<AtomName, any>, type = '@@SET_STATE'): Record<AtomName, any> {
        const prepareState: Record<AtomName, any> = {};

        atoms.forEach((atom) => (prepareState[atom.key] = atom(undefined, { type: '' })));

        state = {
            ...prepareState,
            ...newState,
        };

        notifyActionListeners({ type });
        notifyAtomListeners();

        return state;
    }

    function onGarbageCollected(cb: () => void): Subscription {
        gcSubscriptions.add(cb);
        return createSubscription(() => gcSubscriptions.delete(cb));
    }

    return store;
}

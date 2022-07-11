import { ReadonlyStore, StateSubscription, Store, DispatchSubscription, FlatomConfig } from './store.types';
import { ActionCreator, Action } from './action.types';
import { Atom, AtomName } from './atom.types';
import { createSubscription, Subscription, Unsubscribe } from './common';
import { isAtom } from './declare-atom';
import { createResolver } from './resolver';
import { AtomStore, AtomToken } from './atom-store';

export function createStore(initialState: Record<AtomName, any> = {}, config: FlatomConfig = {}): Store {
    const trace = config.trace ? (msg) => console.log('[flatom/core] ' + msg) : (msg) => null;

    const uninitializedAtomsCache = new Map<AtomName, unknown>();
    const atomStore = new AtomStore();

    let prevState: Record<AtomName, any> = {};
    let state: Record<AtomName, any> = initialState;
    let atoms: AtomToken[] = [];
    const changedAtoms = new Set<AtomToken>();
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
    const innerSubscriptions = new Map<AtomToken, Subscription[]>();
    /**
     * List of targeted subscriptions
     */
    const subscriptions = new Map<any, ((payload: any, prev?: any) => void)[]>();
    /**
     * List of GC subscriptions
     */
    const gcSubscriptions = new Set<Unsubscribe>();
    let gc: AtomToken[] | null = null;

    const resolver = createResolver();

    const readonlyStore: ReadonlyStore = {
        getState,
        subscribe,
        getService: resolver.get,
    };

    const debugAPI = {
        onStateChanged,
    };

    const store: Store = {
        subscribe,
        dispatch,
        getState,
        getService: resolver.get,
        setState,
        onGarbageCollected,
        resolver,
        debugAPI,
    };

    return store;

    function onStateChanged(cb: StateSubscription): Subscription {
        immediateSubscriptions.add(cb);
        return createSubscription(() => immediateSubscriptions.delete(cb));
    }

    function subscribe(cb: DispatchSubscription): Subscription;
    function subscribe(target: Atom<any> | ActionCreator<any>, cb: (payload?: any, prev?: any) => void): Subscription;
    function subscribe(
        target: Atom<any> | ActionCreator<any> | DispatchSubscription,
        cb?: (payload?: any, prev?: any) => void,
    ): Subscription {
        if (cb === void 0) {
            dispatchSubscriptions.add(target as DispatchSubscription);
            return createSubscription(() => dispatchSubscriptions.delete(target as any));
        }

        const subscribeTarget = isAtom(target) ? atomStore.get(target) : (target as ActionCreator<any>).type;

        if (!subscriptions.has(subscribeTarget)) {
            subscriptions.set(subscribeTarget, []);

            if (isAtom(target)) {
                const token = atomStore.get(target);
                innerSubscriptions.set(
                    token,
                    target.relatedAtoms.map((rel) => subscribe(rel, () => null)),
                );
                atoms.push(token);
                uninitializedAtomsCache.delete(target.key);
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

            if (isAtom(target)) removeAtom(atomStore.get(target));
        });
    }

    function removeAtom(token: AtomToken) {
        if (!canRemoveAtom(token)) return;

        if (gc) {
            gc.push(token);
            delete state[token.stateKey];
            atoms = atoms.filter((item) => item !== token);
            innerSubscriptions.get(token)!.forEach((cb) => cb());
            innerSubscriptions.delete(token);
        } else {
            gc = [];
            removeAtom(token);
            if (gc.length) gcSubscriptions.forEach((cb) => cb());
            gc = null;
        }
    }

    function canRemoveAtom(token: AtomToken) {
        const atom = token.atom;
        if (subscriptions.has(atom)) return false;
        if (!atom.relatedAtoms || !atom.relatedAtoms.length) return true;
        if (atoms.some((item) => item.atom.relatedAtoms.indexOf(atom) !== -1)) return false;

        return true;
    }

    function dispatch(action: Action): Promise<any> {
        trace(`dispatch action "${action.type}"`);

        // atoms
        const newState = { ...state };

        let isStateChanged = false;
        atoms.forEach((token) => {
            const lastLocalState = newState[token.stateKey];
            let localState = token.atom.relatedAtoms.reduce((accLocalState, relAtom) => {
                if (!changedAtoms.has(atomStore.get(relAtom))) return accLocalState;

                return token.atom(accLocalState, {
                    type: relAtom,
                    payload: newState[relAtom.key],
                });
            }, lastLocalState);

            localState = token.atom(localState, action);
            if (Object.is(lastLocalState, localState)) return newState;

            changedAtoms.add(token);
            newState[token.stateKey] = localState;
            isStateChanged = true;
        });

        if (isStateChanged) {
            prevState = state;
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
        changedAtoms.forEach((token) => {
            const cbList = subscriptions.get(token);

            if (!cbList) return;

            const atomState = state[token.stateKey];
            const prevAtomState = prevState[token.stateKey];

            cbList.forEach((cb) => cb && cb(atomState, prevAtomState));
        });

        changedAtoms.clear();
        return Promise.resolve();
    }

    function getState(atom?: Atom<any>, selector?: (state: any) => any): any {
        if (!atom) return state;

        let atomState = state[atom.key];

        if (atomState == void 0) {
            atomState = uninitializedAtomsCache.get(atom.key);
            if (atomState == void 0) {
                atomState = atom(undefined, { type: '' });
                uninitializedAtomsCache.set(atom.key, atomState);
            }
        }

        if (selector && typeof selector !== 'function') throw new TypeError('[flatom/core] Invalid selector');

        return selector ? selector(atomState) : atomState;
    }

    function setState(newState: Record<AtomName, any>, type = '@@SET_STATE'): Record<AtomName, any> {
        const prepareState: Record<AtomName, any> = {};

        atoms.forEach((token) => (prepareState[token.stateKey] = token.atom(undefined, { type: '' })));

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
}

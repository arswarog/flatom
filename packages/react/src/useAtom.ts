import { Atom, Store, Subscription } from '@flatom/core';
import { useContext, useEffect, useRef, useState } from 'react';
import { storeContext } from './storeContext';

export function useAtom<TAtom>(atom: Atom<TAtom>): TAtom;
export function useAtom<TAtom, T>(atom: Atom<TAtom>, selector: (value: TAtom) => T, deps: any[]): T;
export function useAtom(atom: Atom<any>, selector?: (value: any) => any, deps?: any[]): any {
    const subscription = useRef<Subscription>();
    const store: Store | null = useContext(storeContext);

    if (!store) throw new Error('[flatom] The store provider is not defined');

    const state = store.getState(atom, selector);
    const [_, setState] = useState(state);

    useEffect(() => () => {
        setTimeout(() => subscription.current && subscription.current.unsubscribe(), 0);
    }, deps ? [...deps.concat(atom)] : [atom]);

    if (!subscription.current) {
        subscription.current = store.subscribe(atom, setState);
        return store.getState(atom, selector);
    }

    return state;
}

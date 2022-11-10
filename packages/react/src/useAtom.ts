import { Atom } from '@flatom/core';
import { useStore } from './useStore';
import useSyncExternalStore from 'use-sync-external-store/shim';

export function useAtom<TAtom>(atom: Atom<TAtom>): TAtom;
export function useAtom<TAtom, T>(atom: Atom<TAtom>, selector: (value: TAtom) => T, deps: any[]): T;
export function useAtom(atom: Atom<any>, selector?: (value: any) => any, deps?: any[]): any {
    const store = useStore();

    return useSyncExternalStore(
        (cb) => store.subscribe(atom, cb),
        () => store.getState(atom),
    );
}

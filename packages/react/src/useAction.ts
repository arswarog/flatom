import { Action, ActionCreator, PayloadActionCreator } from '@flatom/core';
import { useCallback, useContext } from 'react';
import { context } from './storeContext';

export function useAction(cb: ActionCreator, deps?: any[]): () => Promise<any>;
export function useAction<T>(cb: PayloadActionCreator<T>, deps?: any[]): (payload: T) => Promise<any>;
export function useAction(cb: () => Action, deps?: any[]): () => Promise<any>;
export function useAction<ARG1>(cb: (arg1: ARG1) => Action, deps?: any[]): (arg1: ARG1) => Promise<any>;
export function useAction<ARG1, ARG2>(
    cb: (arg1: ARG1, arg2: ARG2) => Action,
    deps?: any[],
): (arg1: ARG1, arg2: ARG2) => Promise<any>;
export function useAction<ARG1, ARG2, ARG3>(
    cb: (arg1: ARG1, arg2: ARG2, arg3: ARG3) => Action,
    deps?: any[],
): (arg1: ARG1, arg2: ARG2, arg3: ARG3) => Promise<any>;
export function useAction<ARG1, ARG2, ARG3, ARG4>(
    cb: (arg1: ARG1, arg2: ARG2, arg3: ARG3, arg4: ARG4) => Action,
    deps?: any[],
): (arg1: ARG1, arg2: ARG2, arg3: ARG3, arg4: ARG4) => Promise<any>;
export function useAction<ARG1, ARG2, ARG3, ARG4, ARG5>(
    cb: (arg1: ARG1, arg2: ARG2, arg3: ARG3, arg4: ARG4, arg5: ARG5) => Action,
    deps?: any[],
): (arg1: ARG1, arg2: ARG2, arg3: ARG3, arg4: ARG4, arg5: ARG5) => Promise<any>;
export function useAction(cb: (...args: any[]) => Action, deps: any[] = []) {
    const store = useContext(context);

    if (!store) throw new Error('[flatom] The store provider is not defined');
    if (typeof cb !== 'function') throw new TypeError('[flatom] Invalid action creator');

    return useCallback((params) => {
        const action = cb(params);
        return action ? store.dispatch(action) : Promise.reject();
    }, deps.concat(store));
}

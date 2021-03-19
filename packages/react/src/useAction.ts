import { AnyAction } from '@flatom/core';
import { useCallback, useContext } from 'react';
import { storeContext } from './storeContext';

export function useAction(cb: (...args: any[]) => AnyAction,
                          deps: any[] = []) {
    const store = useContext(storeContext);

    if (!store) throw new Error('[flatom] The store provider is not defined');
    if (typeof cb !== 'function') throw new TypeError('[flatom] Invalid action creator');

    return useCallback((params) => {
        const action = cb(params);
        if (action)
            store.dispatch(action);
    }, deps.concat(store));
}

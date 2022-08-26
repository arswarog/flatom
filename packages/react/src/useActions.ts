import { useMemo } from 'react';

import { PayloadActionCreator } from '@flatom/core';
import { useStore } from './useStore';

export function useActions<T extends Record<string, unknown>>(actions: {
    [key in keyof T]: PayloadActionCreator<T[key], unknown>;
}): {
    [key in keyof T]: (payload: T[key]) => Promise<any>;
} {
    const store = useStore();

    if (!store) throw new Error('[flatom/react] The store provider is not defined');

    return useMemo(() => {
        const result: Record<string, any> = {};

        Object.entries(actions).forEach(([key, actionCreator]) => {
            if (typeof actionCreator !== 'function') throw new TypeError('[flatom/react] Invalid action creator');

            result[key] = (params) => {
                const action = actionCreator(params);

                return action ? store.dispatch(action) : Promise.reject();
            };
        });

        return result as {
            [key in keyof T]: (payload: T[key]) => Promise<any>;
        };
    }, [store, actions]);
}

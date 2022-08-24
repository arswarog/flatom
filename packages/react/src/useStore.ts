import { Store } from '@flatom/core';
import { useContext } from 'react';
import { context } from './storeContext';

export function useStore(): Store {
    const store = useContext(context);

    if (!store) {
        throw new Error('[flatom/react] The store provider is not defined');
    }

    return store;
}

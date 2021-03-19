import { createContext } from 'react';
import { Store } from '@flatom/core';

export const storeContext = createContext<Store | null>(null);

export const StoreProvider = storeContext.Provider;

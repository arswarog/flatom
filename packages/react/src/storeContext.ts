import { createContext } from 'react';
import { Store } from '@flatom/core';

export const context = createContext<Store | null>(null);

export const StoreProvider = context.Provider;

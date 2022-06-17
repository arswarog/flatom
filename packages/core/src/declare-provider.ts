import { ValueProvider } from './provider.types';
import { ReadonlyStore } from './store.types';

type ProviderFactory<TValue> = (store: ReadonlyStore) => TValue;

let increment = 1;

export function declareProvider<TValue>(factory: ProviderFactory<TValue>): ValueProvider<TValue>;
export function declareProvider<TValue>(key: string, factory: ProviderFactory<TValue>): ValueProvider<TValue>;
/**
 * Safe way to declare new provider
 *
 * This function also checks deps for right type
 */
export function declareProvider<TValue>(
    key: string | ProviderFactory<TValue>,
    factory?: ProviderFactory<TValue>,
): ValueProvider<TValue> {
    if (typeof key === 'function') return declareProvider<TValue>('factory ' + increment++, key);

    if (typeof factory !== 'function') throw new Error(`[flatom/core] Invalid provider factory`);

    return {
        key,
        getValue: factory,
    };
}

function checkProviders(deps: any[]): deps is ValueProvider<any>[] {
    if (deps.some((dep) => !isValueProvider(dep))) throw new Error(`[flatom/core] Invalid dependency`);
    return true;
}

function isValueProvider(target: any): target is ValueProvider<any> {
    return target && typeof target.key === 'string' && typeof target.getValue === 'function';
}

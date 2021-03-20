import { ValueProvider } from './provider.types';
import { ReadonlyStore } from './store.types';

/**
 * Safe way to declare new provider
 *
 * This function also checks deps for right type
 */
export function declareProvider<TValue>(key: string,
                                        factory: (store: ReadonlyStore) => TValue): ValueProvider<TValue>;
export function declareProvider<TValue>(key: string,
                                        deps: ValueProvider<any>[],
                                        factory: (store: ReadonlyStore) => TValue): ValueProvider<TValue>;
export function declareProvider<TValue, D1>(key: string,
                                            deps: [
                                                ValueProvider<D1>,
                                            ],
                                            factory: (store: ReadonlyStore, dep1: D1) => TValue): ValueProvider<TValue>;
export function declareProvider<TValue, D1,
    D2>(key: string,
        deps: [
            ValueProvider<D1>,
            ValueProvider<D2>,
        ],
        factory: (store: ReadonlyStore, dep1: D1, dep2: D2) => TValue): ValueProvider<TValue>;
export function declareProvider<TValue, D1, D2,
    D3>(key: string,
        deps: [
            ValueProvider<D1>,
            ValueProvider<D2>,
            ValueProvider<D3>,
        ],
        factory: (store: ReadonlyStore, dep1: D1, dep2: D2, dep3: D3) => TValue): ValueProvider<TValue>;
export function declareProvider<TValue, D1, D2, D3,
    D4>(key: string,
        deps: [
            ValueProvider<D1>,
            ValueProvider<D2>,
            ValueProvider<D3>,
            ValueProvider<D4>,
        ],
        factory: (store: ReadonlyStore, dep1: D1, dep2: D2, dep3: D3, dep4: D4) => TValue): ValueProvider<TValue>;
export function declareProvider<TValue, D1, D2, D3, D4,
    D5>(key: string,
        deps: [
            ValueProvider<D1>,
            ValueProvider<D2>,
            ValueProvider<D3>,
            ValueProvider<D4>,
            ValueProvider<D5>,
        ],
        factory: (store: ReadonlyStore, dep1: D1, dep2: D2, dep3: D3, dep4: D4, dep5: D5) => TValue): ValueProvider<TValue>;
export function declareProvider<TValue>(key: string,
                                        deps?: ValueProvider<any>[] | ((store: ReadonlyStore, ...deps: any[]) => TValue),
                                        factory?: (store: ReadonlyStore, ...deps: any[]) => TValue): ValueProvider<TValue> {
    let depList: ValueProvider<any>[] = [];
    if (Array.isArray(deps)) {
        depList = deps;
    } else {
        factory = deps;
    }

    if (typeof factory !== 'function')
        throw new Error(`[flatom] Invalid factory`);
    checkProviders(depList);

    function getValue(store: ReadonlyStore): TValue {
        const depValues = store.resolveAll(depList);
        return factory!(store, ...depValues);
    }

    return {
        key,
        getValue,
    };
}

function checkProviders(deps: any[]): deps is ValueProvider<any>[] {
    if (deps.some(dep => !isValueProvider(dep)))
        throw new Error(`[flatom] Invalid dependency`);
    return true;
}

function isValueProvider(target: any): target is ValueProvider<any> {
    return target && typeof target.key === 'string' && typeof target.getValue === 'function';
}

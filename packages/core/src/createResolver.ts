import { ValueProvider, ValueProviders } from './provider.types';
import { Resolver } from './resolver.types';
import { ReadonlyStore } from './store.types';

export function createResolver(store: ReadonlyStore): Resolver {
    const definedProviders = new Map<ValueProvider<any>, any>();
    const resolver: Resolver = {
        resolve,
        resolveMany: resolveMany as any,
    };

    let lastResolvedDepsProviders: ValueProviders<any[]> = [];
    let lastResolvedDepsValue: any[] = [];

    function resolve<T>(provider: ValueProvider<T>): T {
        return provider.getValue(store);
    }

    function resolveMany(providers: ValueProviders<any[]>): any[] {
        if (providers !== lastResolvedDepsProviders)
            lastResolvedDepsValue = providers.map(provider => provider.getValue(store)) as any;
        lastResolvedDepsProviders = providers;
        return lastResolvedDepsValue;
    }

    return resolver;
}

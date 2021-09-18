import { Resolver, Token } from './resolver.types';

export function createResolver(): Resolver {
    const valueMap = new Map<Token<unknown>, unknown>();
    const resolver: Resolver = {
        set: setValue,
        get: resolve,
        unset: unsetValue,
        clear,
        getMany: resolveMany as any,
    };

    function clear() {
        valueMap.clear()
    }

    function setValue<T>(token: Token<T>, value: T) {
        valueMap.set(token, value);
    }

    function unsetValue<T>(token: Token<T>) {
        valueMap.delete(token);
    }

    function resolve<T>(token: Token<T>, allowFail = false): T | undefined {
        if (valueMap.has(token))
            return valueMap.get(token) as T;
        if (allowFail)
            return undefined;
        else
            throw new Error();
    }

    function resolveMany(tokens: Token<any[]>): any[] {
        return [];
        // if (providers !== lastResolvedDepsProviders)
        //     lastResolvedDepsValue = providers.map(provider => provider.getValue(store)) as any;
        // lastResolvedDepsProviders = providers;
        // return lastResolvedDepsValue;
    }

    return resolver;
}

export type PayloadReducer<TState, TPayload> = (state: TState, payload: TPayload) => TState;

export interface Subscription {
    (): void;

    unsubscribe(): void;
}

export type Unsubscribe = () => void;

export function createSubscription(unsubscribe: Unsubscribe): Subscription {
    const result = unsubscribe as Subscription;
    result.unsubscribe = unsubscribe;
    return result;
}

let uniqNumber = 1;

export function resetUniqId(value = 1) {
    uniqNumber = value;
}

export function uniqName(name?: string | (number | string)[] | Readonly<(number | string)[]> | TemplateStringsArray): string {
    if (name) {
        if (typeof name === 'object' && 'raw' in name)
            name = name.raw;

        if (Array.isArray(name))
            name = name.join('/');
    } else {
        name = 'action';
    }
    return name + ' ' + uniqNumber++;
}

export function makeName(name?: string | (number | string)[]): string {
    if (!name)
        return uniqName();
    if (Array.isArray(name))
        return name.join('/');
    else
        return name.toString();
}

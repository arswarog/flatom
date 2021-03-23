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

export function uniqId(name?: string | (number | string)[]): string {
if (Array.isArray(name))
        name = name.join('/');

    return name ? name + ' ' + uniqNumber++ : String(uniqNumber++);
}

export function makeName(name?: string | (number | string)[]): string {
    if (Array.isArray(name))
        return name.join('/');
    else
        return uniqId(name);
}

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

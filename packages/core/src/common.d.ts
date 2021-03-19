export declare type PayloadReducer<TState, TPayload> = (state: TState, payload: TPayload) => TState;
export interface Subscription {
    (): void;
    unsubscribe(): void;
}
export declare type Unsubscribe = () => void;
export declare function createSubscription(unsubscribe: Unsubscribe): Subscription;

import { Store } from './store.types';

export type ActionType = string | (string | number)[];

export type Reaction<Payload = void, Result = void> = (store: Store, payload: Payload) => (Result | Promise<Result> | void);

export interface Action<T = unknown> {
    type: string;
    payload?: T;
    reaction?: Reaction<any, any>;
}

export interface SimpleAction extends Action<void> {
    type: string;
    reaction?: Reaction<any, any>;
}

export interface PayloadAction<Payload, Result = void> extends Action<Payload> {
    payload: Payload;
    reaction?: Reaction<Payload, Result>;
}

export interface ActionCreator<Result = void> {
    readonly type: string;

    /**
     * For compatibility with reatom
     */
    getType(): string;

    (): Action<Result>;
}

export interface PayloadlessActionCreator {
    readonly type: string;

    /**
     * For compatibility with reatom
     */
    getType(): string;

    (): Action;
}

export interface PayloadActionCreator<Payload, Result = void> {
    readonly type: string;

    /**
     * For compatibility with reatom
     */
    getType(): string;

    (payload: Payload): PayloadAction<Payload, Result>;
}

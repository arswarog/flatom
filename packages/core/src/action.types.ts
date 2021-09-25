import { Store } from './store.types';

export type ActionType = string | (string | number)[];

export type Reaction<Payload = void, Result = void> = (store: Store, payload: Payload) => (Result | Promise<Result> | void);

export interface Action {
    type: string;
}

export interface AnyAction<Result = any> {
    type: string;
    payload?: any;
    reaction?: Reaction<any, Result>;
}

export interface PayloadAction<Payload, Result = void> extends AnyAction<Result> {
    payload: Payload;
    reaction?: Reaction<Payload, Result>;
}

export interface ActionCreator<Result = void> {
    readonly type: string;

    (): AnyAction<Result>;
}

export interface PayloadlessActionCreator {
    readonly type: string;

    (): Action;
}

export interface PayloadActionCreator<Payload, Result = void> {
    readonly type: string;

    (payload: Payload): PayloadAction<Payload, Result>;
}

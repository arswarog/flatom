import { Store } from './store.types';

export type ActionType = string | (string | number)[];

export type PrepareAction<Payload> = (store: Store) => Payload;
export type PrepareActionWithParams<Payload, Params> = (store: Store, params: Params) => Payload;
export type Reaction<Payload, Result = void> = (store: Store, payload?: Payload) => Result | Promise<Result> | void;

export interface AnyAction<Result = any> {
    type: string;
    payload?: any;
    reaction?: Reaction<any, Result>;
}

export interface PayloadAction<Payload, Result = void> extends AnyAction<Result> {
    payload: Payload;
    reaction?: Reaction<Payload, Result>;
}

export interface SmartAction<Payload, Params, Result = void> extends PayloadAction<Payload, Result> {
    payload: Payload;
    params: Params;
}

export interface ActionCreator<Result = void> {
    readonly type: string;

    (): AnyAction<Result>;
}

export interface PayloadActionCreator<Payload, Result = void> {
    readonly type: string;

    (payload: Payload): PayloadAction<Payload, Result>;
}

export interface SmartActionCreator<Payload, Params = Payload, Result = void> {
    readonly type: string;

    (payload: Params, store: Store): SmartAction<Payload, Params, Result>;
}

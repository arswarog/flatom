import { Store } from './store.types';

export interface AnyAction<T = any> {
    type: string;
    payload?: T;
}

export type ActionType = string;

export type PayloadOf<T> = T extends ActionCreator<infer R> ? R : never;

export interface AnyActionCreator<TPayload> {
    readonly type: ActionType;

    (payload?: TPayload): { type: string, payload: TPayload };
}

export interface ActionCreator<TPayload> extends AnyActionCreator<TPayload> {
    (payload: TPayload): { type: string, payload: TPayload };
}

export interface PayloadActionCreator<TPayload> extends AnyActionCreator<TPayload> {
    (payload: TPayload): { type: string, payload: TPayload };
}

export interface ActionCreatorWithParams<TPayload, TParams extends object> extends PayloadActionCreator<TPayload> {
    (params: TParams, store?: Store): { type: string, payload: TPayload };
}

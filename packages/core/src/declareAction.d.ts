import { ValueProvider } from './provider';
import { Store } from './store';
export interface AnyAction<T = any> {
    type: string;
    payload?: T;
}
export declare type ActionType = string;
export declare type PayloadOf<T> = T extends ActionCreator<infer R> ? R : never;
export interface AnyActionCreator<TPayload> {
    readonly type: ActionType;
    (payload?: TPayload): {
        type: string;
        payload: TPayload;
    };
}
export interface ActionCreator<TPayload> extends AnyActionCreator<TPayload> {
    (payload: TPayload): {
        type: string;
        payload: TPayload;
    };
}
export interface PayloadActionCreator<TPayload> extends AnyActionCreator<TPayload> {
    (payload: TPayload): {
        type: string;
        payload: TPayload;
    };
}
export interface ActionCreatorWithParams<TPayload, TParams extends object> extends PayloadActionCreator<TPayload> {
    (params: TParams, store?: Store): {
        type: string;
        payload: TPayload;
    };
}
export declare function declareAction(type: string): ActionCreator<any>;
export declare function declareAction<TPayload extends object>(type: string): PayloadActionCreator<TPayload>;
export declare function declareAction<TPayload extends object, TParams extends object>(type: string, modifier: (params: TParams) => TPayload): ActionCreatorWithParams<TPayload, TParams>;
export declare function declareAction<TPayload extends object, TParams extends object, T1 extends any>(type: string, providers: [
    ValueProvider<T1>
], prepare: (payload: TParams, ...args: [T1]) => TPayload): ActionCreatorWithParams<TPayload, TParams>;
export declare function declareAction<TPayload extends object, TParams extends object, T1 extends any, T2 extends any>(type: string, providers: [
    ValueProvider<T1>,
    ValueProvider<T2>
], prepare: (payload: TParams, ...args: [T1, T2]) => TPayload): ActionCreatorWithParams<TPayload, TParams>;
export declare function declareAction<TPayload extends object, TParams extends object, T1 extends any, T2 extends any, T3 extends any>(type: string, providers: [
    ValueProvider<T1>,
    ValueProvider<T2>,
    ValueProvider<T3>
], prepare: (payload: TParams, ...args: [T1, T2, T3]) => TPayload): ActionCreatorWithParams<TPayload, TParams>;
export declare function isActionCreator<T>(target: any): target is ActionCreator<T>;

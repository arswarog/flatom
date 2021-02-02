import { ValueProvider } from './provider';
import { Store } from './store';

export interface AnyAction<T = any> {
    type: string;
    payload?: T;
}

const actionCreatorSymbol = Symbol('ActionCreator');

export type ActionType = string;

export type PayloadOf<T> = T extends ActionCreator<infer R> ? R : never;

export interface AnyActionCreator<TPayload> {
    readonly [actionCreatorSymbol]: Symbol;

    readonly type: ActionType;

    (payload?: TPayload): { type: string, payload: TPayload };
}

export interface ActionCreator<TPayload> extends AnyActionCreator<TPayload> {
    (payload: TPayload): { type: string, payload: TPayload };
}

export interface PayloadActionCreator<TPayload> {
    readonly [actionCreatorSymbol]: Symbol;

    readonly type: ActionType;

    (payload: TPayload): { type: string, payload: TPayload };
}

export interface ActionCreatorWithParams<TPayload, TParams extends object> extends PayloadActionCreator<TPayload> {
    (params: TParams, store?: Store): { type: string, payload: TPayload };
}

export function declareAction(type: string): ActionCreator<any>;
export function declareAction<TPayload extends object>(type: string): PayloadActionCreator<TPayload>;
export function declareAction<TPayload extends object, TParams extends object>(
    type: string,
    modifier: (params: TParams) => TPayload,
): ActionCreatorWithParams<TPayload, TParams>;
export function declareAction<TPayload extends object, TParams extends object,
    T1 extends any>(
    type: string,
    providers: [
        ValueProvider<T1>,
    ],
    prepare: (
        payload: TParams,
        ...args: [T1]
    ) => TPayload,
): ActionCreatorWithParams<TPayload, TParams>;
export function declareAction<TPayload extends object, TParams extends object,
    T1 extends any,
    T2 extends any>(
    type: string,
    providers: [
        ValueProvider<T1>,
        ValueProvider<T2>,
    ],
    prepare: (
        payload: TParams,
        ...args: [T1, T2]
    ) => TPayload,
): ActionCreatorWithParams<TPayload, TParams>;
export function declareAction<TPayload extends object, TParams extends object,
    T1 extends any,
    T2 extends any,
    T3 extends any>(
    type: string,
    providers: [
        ValueProvider<T1>,
        ValueProvider<T2>,
        ValueProvider<T3>,
    ],
    prepare: (
        payload: TParams,
        ...args: [T1, T2, T3]
    ) => TPayload,
): ActionCreatorWithParams<TPayload, TParams>;
export function declareAction<TParams extends object, TPayload extends object>(
    type: string,
    providers?: ValueProvider<any>[] | ((payload: TParams, ...args: any[]) => TPayload),
    modifier?: (payload: TParams, ...args: any[]) => TPayload,
): ActionCreator<TPayload> {
    if (Array.isArray(providers)) {
        if (typeof modifier === 'function')
            return makeActionCreator(
                type,
                makeActionCreatorWithProviders(type, modifier, providers),
            );
        else
            throw new Error('If you set providers you must set modifier');
    }
    if (typeof providers === 'function')
        return makeActionCreator(
            type,
            makeActionCreatorWithParams(type, providers),
        );

    return makeActionCreator(
        type,
        (payload: TPayload) => ({
            type,
            payload,
        }),
    );
}

function makeActionCreator<TPayload>(type: string, fn: (params?: any, store?: Store) => any): ActionCreator<TPayload> {
    const result: any = fn;
    result.type = type;
    result[actionCreatorSymbol] = actionCreatorSymbol;
    return result;
}

function makeActionCreatorWithParams(type: string, modifier: (payload: any, ...args: any[]) => any) {
    return (params: any) => ({
        type,
        payload: modifier(params),
        params,
    });
}

function makeActionCreatorWithProviders(type: string, modifier: (payload: any, ...args: any[]) => any, providers: ValueProvider<any>[]) {
    return (params: any, store?: Store) => {
        if (!store)
            throw new Error('Store is required');

        const values = store.resolve(...providers);

        return {
            type,
            payload: modifier(params, ...values),
            params,
        };
    };
}

export function isActionCreator<T>(target: any): target is ActionCreator<T> {
    return target[actionCreatorSymbol] === actionCreatorSymbol;
}

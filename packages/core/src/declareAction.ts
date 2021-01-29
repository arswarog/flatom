import { StateProvider } from './provider';

export interface AnyAction<T = any> {
    type: string;
    payload?: T;
}

const actionCreatorSymbol = Symbol('ActionCreator');

export type ActionType = string;

export interface ActionCreator<TPayload> {
    readonly [actionCreatorSymbol]: Symbol;

    readonly type: ActionType;

    (param: TPayload): { type: string, payload: TPayload };
}

export type ActionCreatorWithParams<TPayload extends object, TParams extends object> = ActionCreator<TPayload>;

export function declareAction<TPayload extends object>(type: string): ActionCreator<TPayload>;
export function declareAction<TPayload extends object, TParams extends object>(
    type: string,
    prepare: (params: TParams) => TPayload,
): ActionCreator<TPayload>;
export function declareAction<TParams extends object, TPayload extends object, T1 extends any>(
    type: string,
    providers: [
        StateProvider<T1>,
    ],
    prepare: (
        payload: TParams,
        ...args: [T1,]) => TPayload,
): ActionCreatorWithParams<TParams, TPayload>;
export function declareAction<TParams extends object, TPayload extends object, T1 extends any,
    T2 extends any>(
    type: string,
    providers: [
        StateProvider<T1>,
        StateProvider<T2>,
    ],
    prepare: (
        payload: TParams,
        ...args: [T1, T2]) => TPayload,
): ActionCreatorWithParams<TParams, TPayload>;
export function declareAction<TParams extends object, TPayload extends object>(
    type: string,
    providers?: StateProvider<any>[] | ((payload: TParams, ...args: any[]) => TPayload),
    prepare?: (payload: TParams, ...args: any[]) => TPayload,
): ActionCreator<TPayload> {
    const actionCreator: any = (payload: TPayload) => ({
        type,
        payload,
    });
    actionCreator.type = type;
    actionCreator[actionCreatorSymbol] = actionCreatorSymbol;
    return actionCreator as ActionCreator<TPayload>;
}

export function isActionCreator<T>(target: any): target is ActionCreator<T> {
    return target[actionCreatorSymbol] === actionCreatorSymbol;
}

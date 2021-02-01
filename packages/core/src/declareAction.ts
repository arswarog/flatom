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

export type ActionCreatorWithParams<TPayload, TParams extends object> = PayloadActionCreator<TPayload>;

export function declareAction(type: string): ActionCreator<any>;
export function declareAction<TPayload extends object>(type: string): PayloadActionCreator<TPayload>;
export function declareAction<TPayload extends object, TParams extends object>(
    type: string,
    prepare: (params: TParams) => TPayload,
): ActionCreator<TPayload>;
export function declareAction<TParams extends object, TPayload extends object>(
    type: string,
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

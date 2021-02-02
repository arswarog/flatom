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
    (params: TParams): { type: string, payload: TPayload };
}

export function declareAction(type: string): ActionCreator<any>;
export function declareAction<TPayload extends object>(type: string): PayloadActionCreator<TPayload>;
export function declareAction<TPayload extends object, TParams extends object>(
    type: string,
    modifier: (params: TParams) => TPayload,
): ActionCreatorWithParams<TPayload, TParams>;
export function declareAction<TParams extends object, TPayload extends object>(
    type: string,
    modifier?: (payload: TParams, ...args: any[]) => TPayload,
): ActionCreator<TPayload> {
    const actionCreator: any = modifier && typeof modifier === 'function'
        ? (params: TParams) => ({
            type,
            payload: modifier(params),
            params,
        })
        : (payload: TPayload) => ({
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

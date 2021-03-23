import {
    ActionCreator,
    ActionType,
    PayloadActionCreator,
    PrepareAction, PrepareActionWithParams,
    Reaction, SmartActionCreator,
} from './action.types';
import { makeName } from './common';
import { Store } from './store.types';

export function declareAction(type?: ActionType): ActionCreator;
export function declareAction<Result>(reaction: Reaction<undefined, Result>): ActionCreator<Result>;
export function declareAction<Result>(type: ActionType, reaction: Reaction<Result>): ActionCreator<Result>;
export function declareAction<Payload>(type?: ActionType): PayloadActionCreator<Payload>;
export function declareAction<Payload, Result = any>(reaction: Reaction<Payload, Result>): PayloadActionCreator<Payload, Result>;
export function declareAction<Payload, Result = any>(type: ActionType, reaction: Reaction<Payload, Result>): PayloadActionCreator<Payload, Result>;

export function declareAction(
    type?: ActionType | Reaction<any>,
    reaction?: Reaction<any>,
): ActionCreator | PayloadActionCreator<any> {
    if (typeof type === 'function')
        return declareAction('', type);

    type = makeName(type || 'action');

    const actionCreator = (payload) => ({
        type: type as string,
        payload,
        reaction,
    });
    actionCreator.type = type;
    return actionCreator;
}

export function declareSmartAction<Payload, Params>(prepare: PrepareAction<Payload> | PrepareActionWithParams<Payload, Params>,
                                                    reaction?: Reaction<Payload>): SmartActionCreator<Payload, Params>;
export function declareSmartAction<Payload, Params>(type: string | (number | string)[],
                                                    prepare: PrepareAction<Payload> | PrepareActionWithParams<Payload, Params>,
                                                    reaction?: Reaction<Payload>): SmartActionCreator<Payload, Params>;
export function declareSmartAction<Payload, Params>(type: string | (number | string)[] | PrepareAction<Payload> | PrepareActionWithParams<Payload, Params>,
                                                    prepare?: PrepareAction<Payload> | PrepareActionWithParams<Payload, Params>,
                                                    reaction?: Reaction<Payload>): SmartActionCreator<Payload, Params> {
    if (typeof type === 'function')
        return declareSmartAction('', type);

    type = makeName(type || 'action');

    if (!prepare)
        throw new Error(`[flatom] Prepare function is required`);

    const smartActionCreator = (params: Params, store: Store) => {
        const payload = prepare(store, params);
        return reaction
            ? {
                type: type as string,
                payload,
                reaction,
                params,
            }
            : {
                type: type as string,
                payload,
                reaction,
                params,
            };
    };
    smartActionCreator.type = type;
    return smartActionCreator;
}

export function isActionCreator<T>(target: any): target is ActionCreator<T> {
    return typeof target === 'function' && typeof target.type === 'string';
}

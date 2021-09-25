import {
    ActionCreator,
    ActionType,
    PayloadActionCreator,
    Reaction,
} from './action.types';
import { makeName, uniqName } from './common';

export function declareAction(type?: ActionType): ActionCreator;
export function declareAction<Payload>(type?: ActionType): PayloadActionCreator<Payload>;

export function declareAction(
    type?: ActionType,
): ActionCreator | PayloadActionCreator<any> {
    type = makeName(type || uniqName('action'));

    const actionCreator = (payload) => ({
        type: type as string,
        payload,
    });
    actionCreator.type = type;
    return actionCreator;
}

export function declareEffect<Payload = void, Result = unknown>(
    type: ActionType,
    reaction: Reaction<Payload, Result>,
): PayloadActionCreator<Payload, Result>;
export function declareEffect<Payload = void, Result = unknown>(
    type: ActionType,
    reaction: Reaction<Payload, Result>,
): PayloadActionCreator<Payload, Result> {
    type = makeName(type || uniqName('action'));

    const actionCreator = (payload) => ({
        type: type as string,
        payload,
        reaction,
    });
    actionCreator.type = type;
    return actionCreator;
}

export function isActionCreator<T>(target: any): target is ActionCreator<T> {
    return typeof target === 'function' && typeof target.type === 'string';
}
